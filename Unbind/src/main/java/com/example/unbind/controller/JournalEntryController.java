package com.example.unbind.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.unbind.domain.JournalEntry;
import com.example.unbind.service.JournalEntryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/entries")
@RequiredArgsConstructor
public class JournalEntryController {
	private final JournalEntryService service;

	@PostMapping
	public JournalEntry create(@RequestBody JournalEntry entry, Authentication authentication) {
		String email = authentication.getName();
		return service.create(entry, email);
	}

	@GetMapping
	public List<JournalEntry> getAll(Authentication authentication) {
		String email = authentication.getName();
		return service.getAll(email);
	}

	@GetMapping("/{id}")
	public JournalEntry get(@PathVariable("id") Long id, Authentication authentication) {
		return service.get(id, authentication.getName());
	}

	@GetMapping("/tags")
	public List<String> getTags(Authentication authentication) {
		return service.getTags(authentication.getName());
	}
}
