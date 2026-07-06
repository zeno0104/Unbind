package com.example.unbind.controller;

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
}