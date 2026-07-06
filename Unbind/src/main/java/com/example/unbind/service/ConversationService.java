package com.example.unbind.service;

import com.example.unbind.domain.*;
import com.example.unbind.mapper.ActionItemMapper;
import com.example.unbind.mapper.ConversationTurnMapper;
import com.example.unbind.mapper.JournalEntryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationService {

	private final ClaudeService claudeService;
	private final ConversationTurnMapper turnMapper;
	private final ActionItemMapper actionItemMapper;
	private final JournalEntryMapper journalEntryMapper;

	public List<String> generateFragments(Long entryId) {
		JournalEntry entry = journalEntryMapper.findById(entryId);
		FragmentResponse response = claudeService.splitIntoFragments(entry.getSituationText());

		List<String> fragments = response.getFragments();
		for (int i = 0; i < fragments.size(); i++) {
			ConversationTurn turn = new ConversationTurn();
			turn.setEntryId(entryId);
			turn.setRole("AI");
			turn.setContent(fragments.get(i));
			turn.setStepType(null);
			turn.setTurnOrder(i + 1);
			turnMapper.insert(turn);
		}
		return fragments;
	}

	public ActionItem classify(Long entryId, List<Long> heldTurnIds, List<Long> releasedTurnIds) {
		for (Long id : heldTurnIds) {
			turnMapper.updateStepType(id, "HELD");
		}
		for (Long id : releasedTurnIds) {
			turnMapper.updateStepType(id, "RELEASED");
		}

		List<ConversationTurn> allTurns = turnMapper.findByEntryId(entryId);
		StringBuilder heldItemsText = new StringBuilder();
		for (ConversationTurn turn : allTurns) {
			if (heldTurnIds.contains(turn.getId())) {
				heldItemsText.append("- ").append(turn.getContent()).append("\n");
			}
		}

		ActionItemResponse response = claudeService.suggestActionItem(heldItemsText.toString());

		ActionItem actionItem = new ActionItem();
		actionItem.setEntryId(entryId);
		actionItem.setContent(response.getActionItem());
		actionItemMapper.insert(actionItem);

		return actionItem;
	}
}