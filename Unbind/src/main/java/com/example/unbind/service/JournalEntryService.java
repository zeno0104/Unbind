package com.example.unbind.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.unbind.domain.JournalEntry;
import com.example.unbind.domain.User;
import com.example.unbind.mapper.JournalEntryMapper;
import com.example.unbind.mapper.UserMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JournalEntryService {
	private final JournalEntryMapper mapper;
	private final UserMapper userMapper;

	public JournalEntry create(JournalEntry entry, String email) {
		User user = userMapper.findByEmail(email);
		entry.setUserId(user.getId());

		mapper.insert(entry);

		return entry;
	}

	public JournalEntry get(Long id) {

		return mapper.findById(id);
	}

	public List<JournalEntry> getAll(String email) {
		User user = userMapper.findByEmail(email);
		return mapper.findAllByUserId(user.getId());
	}

	public List<String> getTags(String email) {
		User user = userMapper.findByEmail(email);
		return mapper.findDistinctTagsByUserId(user.getId());
	}

}
