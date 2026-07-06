package com.example.unbind.controller;

import com.example.unbind.domain.ActionItem;
import com.example.unbind.service.ConversationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/entries")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ConversationController {

	private final ConversationService conversationService;

	@PostMapping("/{entryId}/fragments")
	public List<String> generateFragments(@PathVariable("entryId") Long entryId) {
		return conversationService.generateFragments(entryId);
	}

	@PostMapping("/{entryId}/classify")
	public ActionItem classify(@PathVariable("entryId") Long entryId, @RequestBody ClassifyRequest request) {
		return conversationService.classify(entryId, request.getHeldTurnIds(), request.getReleasedTurnIds());
	}

	@Data
	public static class ClassifyRequest {
		private List<Long> heldTurnIds;
		private List<Long> releasedTurnIds;
	}
}