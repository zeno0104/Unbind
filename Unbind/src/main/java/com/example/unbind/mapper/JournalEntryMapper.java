package com.example.unbind.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.example.unbind.domain.JournalEntry;

@Mapper
public interface JournalEntryMapper {
	void insert(JournalEntry entry);
	JournalEntry findById(Long id);
}
