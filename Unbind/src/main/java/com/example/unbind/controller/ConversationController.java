package com.example.unbind.controller;

import com.example.unbind.domain.ActionItem;
import com.example.unbind.domain.ActionOption;
import com.example.unbind.domain.ConversationTurn;
import com.example.unbind.service.ConversationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/entries")
@RequiredArgsConstructor
public class ConversationController {

	private final ConversationService conversationService;

	@PostMapping("/{entryId}/conversation/start")
	public ConversationTurn startConversation(@PathVariable("entryId") Long entryId, Authentication authentication) {
		return conversationService.startConversation(entryId, authentication.getName());
	}

	@PostMapping("/{entryId}/conversation/messages")
	public ConversationTurn sendMessage(@PathVariable("entryId") Long entryId, @RequestBody MessageRequest request,
			Authentication authentication) {
		return conversationService.sendMessage(entryId, request.getMessage(), authentication.getName());
	}

	@PostMapping("/{entryId}/conversation/phase2")
	public ConversationTurn startPhase2(@PathVariable("entryId") Long entryId, Authentication authentication) {
		return conversationService.startPhase2(entryId, authentication.getName());
	}

	@GetMapping("/{entryId}/conversation")
	public List<ConversationTurn> getConversation(@PathVariable("entryId") Long entryId, Authentication authentication) {
		return conversationService.getConversation(entryId, authentication.getName());
	}

	@PostMapping("/{entryId}/conclude")
	public List<ActionOption> conclude(@PathVariable("entryId") Long entryId, Authentication authentication) {
		return conversationService.concludeWithOptions(entryId, authentication.getName());
	}

	@PostMapping("/{entryId}/action-item")
	public ActionItem selectActionItem(@PathVariable("entryId") Long entryId, @RequestBody ActionItemRequest request,
			Authentication authentication) {
		return conversationService.selectActionItem(entryId, request.getContent(), authentication.getName());
	}

	@GetMapping("/{entryId}/action-item")
	public ActionItem getActionItem(@PathVariable("entryId") Long entryId, Authentication authentication) {
		return conversationService.getActionItem(entryId, authentication.getName());
	}

	@PatchMapping("/{entryId}/action-item/complete")
	public void completeActionItem(@PathVariable("entryId") Long entryId, @RequestBody FeedbackRequest request,
			Authentication authentication) {
		conversationService.completeActionItem(entryId, request.getFeedback(), authentication.getName());
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