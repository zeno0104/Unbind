package com.example.unbind.controller;

import com.example.unbind.domain.ActionItemResponse;
import com.example.unbind.domain.FragmentResponse;
import com.example.unbind.service.ClaudeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class TestController {

	private final ClaudeService claudeService;

	@GetMapping("/test-claude")
	public String testClaude(@RequestParam("prompt") String prompt) {
		return claudeService.ask(prompt);
	}

	@GetMapping("/test-fragments")
	public FragmentResponse testFragments(@RequestParam("situation") String situation) {
		return claudeService.splitIntoFragments(situation);
	}

	@GetMapping("/test-action")
	public ActionItemResponse testAction(@RequestParam("items") String items) {
		return claudeService.suggestActionItem(items);
	}
}