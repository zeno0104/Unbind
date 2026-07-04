package com.example.unbind.controller;

import java.util.List;

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
@CrossOrigin(origins = "http://localhost:5173")
public class JournalEntryController {
	private final JournalEntryService service;
	
	@PostMapping
	public JournalEntry create(@RequestBody JournalEntry entry) {
		return service.create(entry);
	}

	@GetMapping
	public List<JournalEntry> getAll() {
		return service.getAll();
	}
	
	@GetMapping("/{id}")
	public JournalEntry get(@PathVariable("id") Long id) {
		return service.get(id);
	}
}
