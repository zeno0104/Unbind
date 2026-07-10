package com.example.unbind.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.unbind.domain.JournalEntry;
import com.example.unbind.domain.User;
import com.example.unbind.exception.AppException;
import com.example.unbind.mapper.ActionItemMapper;
import com.example.unbind.mapper.ConversationTurnMapper;
import com.example.unbind.mapper.ForestKnotMapper;
import com.example.unbind.mapper.ForestReactionMapper;
import com.example.unbind.mapper.ForestScrapMapper;
import com.example.unbind.mapper.JournalEntryMapper;
import com.example.unbind.mapper.UserMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JournalEntryService {
	private final JournalEntryMapper mapper;
	private final UserMapper userMapper;
	private final ConversationTurnMapper conversationTurnMapper;
	private final ActionItemMapper actionItemMapper;
	private final ForestReactionMapper forestReactionMapper;
	private final ForestScrapMapper forestScrapMapper;
	private final ForestKnotMapper forestKnotMapper;

	public JournalEntry create(JournalEntry entry, String email) {
		User user = userMapper.findByEmail(email);
		entry.setUserId(user.getId());

		mapper.insert(entry);

		return entry;
	}

	public JournalEntry get(Long id, String email) {
		JournalEntry entry = mapper.findById(id);
		if (entry == null) {
			throw new AppException(HttpStatus.NOT_FOUND, "그 기록을 찾을 수 없어요.");
		}

		User user = userMapper.findByEmail(email);
		if (!entry.getUserId().equals(user.getId())) {
			throw new AppException(HttpStatus.FORBIDDEN, "본인의 기록만 볼 수 있어요.");
		}

		return entry;
	}

	public List<JournalEntry> getAll(String email) {
		User user = userMapper.findByEmail(email);
		return mapper.findAllByUserId(user.getId());
	}

	public List<String> getTags(String email) {
		User user = userMapper.findByEmail(email);
		return mapper.findDistinctTagsByUserId(user.getId());
	}

	@Transactional
	public void delete(Long id, String email) {
		JournalEntry entry = mapper.findById(id);
		if (entry == null) {
			throw new AppException(HttpStatus.NOT_FOUND, "그 기록을 찾을 수 없어요.");
		}

		User user = userMapper.findByEmail(email);
		if (!entry.getUserId().equals(user.getId())) {
			throw new AppException(HttpStatus.FORBIDDEN, "본인의 기록만 삭제할 수 있어요.");
		}

		forestReactionMapper.deleteByEntryId(id);
		forestScrapMapper.deleteByEntryId(id);
		forestKnotMapper.deleteByEntryId(id);
		conversationTurnMapper.deleteByEntryId(id);
		actionItemMapper.deleteByEntryId(id);
		mapper.deleteById(id);
	}

}
