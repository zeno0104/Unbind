package com.example.unbind.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.example.unbind.domain.JournalEntry;
import com.example.unbind.domain.User;

@Mapper
public interface JournalEntryMapper {
	void insert(JournalEntry entry);

	JournalEntry findById(Long id);

	List<JournalEntry> findAllByUserId(Long userId);

	List<String> findDistinctTagsByUserId(Long userId);
}
