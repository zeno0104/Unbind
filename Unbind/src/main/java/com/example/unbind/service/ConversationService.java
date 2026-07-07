package com.example.unbind.service;

import com.example.unbind.domain.*;
import com.example.unbind.mapper.ActionItemMapper;
import com.example.unbind.mapper.ConversationTurnMapper;
import com.example.unbind.mapper.JournalEntryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationService {

	private final ClaudeService claudeService;
	private final ConversationTurnMapper turnMapper;
	private final ActionItemMapper actionItemMapper;
	private final JournalEntryMapper journalEntryMapper;

	public ConversationTurn startConversation(Long entryId) {
		JournalEntry entry = journalEntryMapper.findById(entryId);
		String reply = claudeService.startPhase1(entry.getSituationText());
		return saveTurn(entryId, "AI", reply, "PHASE1");
	}

	public ConversationTurn sendMessage(Long entryId, String userMessage) {
		saveTurn(entryId, "USER", userMessage, null);
		List<ConversationTurn> history = turnMapper.findByEntryId(entryId);

		long phase1AiCount = history.stream().filter(t -> "AI".equals(t.getRole()) && "PHASE1".equals(t.getStepType()))
				.count();
		boolean hasTransition = history.stream().anyMatch(t -> "TRANSITION".equals(t.getStepType()));
		boolean hasPhase2 = history.stream().anyMatch(t -> "PHASE2".equals(t.getStepType()));

		if (phase1AiCount < 2) {
			String reply = claudeService.continuePhase1(history);
			return saveTurn(entryId, "AI", reply, "PHASE1");
		}
		if (!hasTransition) {
			String reply = claudeService.transition(history);
			return saveTurn(entryId, "AI", reply, "TRANSITION");
		}
		if (!hasPhase2) {
			String reply = claudeService.startPhase2(history);
			return saveTurn(entryId, "AI", reply, "PHASE2");
		}

		PhaseReply phaseReply = claudeService.continuePhase2(history);
		ConversationTurn turn = saveTurn(entryId, "AI", phaseReply.getMessage(), "PHASE2");
		turn.setReadyToConclude(phaseReply.isReadyToConclude());
		return turn;
	}

	public ConversationTurn startPhase2(Long entryId) {
		List<ConversationTurn> history = turnMapper.findByEntryId(entryId);
		String reply = claudeService.startPhase2(history);
		return saveTurn(entryId, "AI", reply, "PHASE2");
	}

	public List<ActionOption> concludeWithOptions(Long entryId) {
		List<ConversationTurn> history = turnMapper.findByEntryId(entryId);
		return claudeService.suggestOptions(history).getOptions();
	}

	public ActionItem selectActionItem(Long entryId, String content) {
		ActionItem actionItem = new ActionItem();
		actionItem.setEntryId(entryId);
		actionItem.setContent(content);
		actionItemMapper.insert(actionItem);
		return actionItem;
	}

	public List<ConversationTurn> getConversation(Long entryId) {
		return turnMapper.findByEntryId(entryId);
	}

	public ActionItem getActionItem(Long entryId) {
		return actionItemMapper.findByEntryId(entryId);
	}

	public void completeActionItem(Long entryId, String feedback) {
		actionItemMapper.updateCompleted(entryId, 1, feedback);
	}

	private ConversationTurn saveTurn(Long entryId, String role, String content, String stepType) {
		List<ConversationTurn> existing = turnMapper.findByEntryId(entryId);
		ConversationTurn turn = new ConversationTurn();
		turn.setEntryId(entryId);
		turn.setRole(role);
		turn.setContent(content);
		turn.setStepType(stepType);
		turn.setTurnOrder(existing.size() + 1);
		turnMapper.insert(turn);
		return turn;
	}
}