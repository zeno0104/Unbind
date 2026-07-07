package com.example.unbind.controller;

import com.example.unbind.domain.ActionItem;
import com.example.unbind.domain.ActionOption;
import com.example.unbind.domain.ConversationTurn;
import com.example.unbind.service.ConversationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/entries")
@RequiredArgsConstructor
public class ConversationController {

	private final ConversationService conversationService;

	@PostMapping("/{entryId}/conversation/start")
	public ConversationTurn startConversation(@PathVariable("entryId") Long entryId) {
		return conversationService.startConversation(entryId);
	}

	@PostMapping("/{entryId}/conversation/messages")
	public ConversationTurn sendMessage(@PathVariable("entryId") Long entryId, @RequestBody MessageRequest request) {
		return conversationService.sendMessage(entryId, request.getMessage());
	}

	@PostMapping("/{entryId}/conversation/phase2")
	public ConversationTurn startPhase2(@PathVariable("entryId") Long entryId) {
		return conversationService.startPhase2(entryId);
	}

	@GetMapping("/{entryId}/conversation")
	public List<ConversationTurn> getConversation(@PathVariable("entryId") Long entryId) {
		return conversationService.getConversation(entryId);
	}

	@PostMapping("/{entryId}/conclude")
	public List<ActionOption> conclude(@PathVariable("entryId") Long entryId) {
		return conversationService.concludeWithOptions(entryId);
	}

	@PostMapping("/{entryId}/action-item")
	public ActionItem selectActionItem(@PathVariable("entryId") Long entryId, @RequestBody ActionItemRequest request) {
		return conversationService.selectActionItem(entryId, request.getContent());
	}

	@GetMapping("/{entryId}/action-item")
	public ActionItem getActionItem(@PathVariable("entryId") Long entryId) {
		return conversationService.getActionItem(entryId);
	}

	@PatchMapping("/{entryId}/action-item/complete")
	public void completeActionItem(@PathVariable("entryId") Long entryId, @RequestBody FeedbackRequest request) {
		conversationService.completeActionItem(entryId, request.getFeedback());
	}

	@Data
	public static class FeedbackRequest {
		private String feedback;
	}

	@Data
	public static class MessageRequest {
		private String message;
	}

	@Data
	public static class ActionItemRequest {
		private String content;
	}
}