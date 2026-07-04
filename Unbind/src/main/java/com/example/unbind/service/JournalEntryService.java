package com.example.unbind.service;

import org.springframework.stereotype.Service;

import com.example.unbind.domain.JournalEntry;
import com.example.unbind.mapper.JournalEntryMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JournalEntryService {
	private final JournalEntryMapper mapper;

	public JournalEntry create(JournalEntry entry) {
		
		mapper.insert(entry);
		
		return entry;
	}

	public JournalEntry get(Long id) {
		
		return mapper.findById(id);
	}

}
