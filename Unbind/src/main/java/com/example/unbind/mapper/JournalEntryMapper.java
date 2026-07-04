package com.example.unbind.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.example.unbind.domain.JournalEntry;

@Mapper
public interface JournalEntryMapper {
	void insert(JournalEntry entry);
	JournalEntry findById(Long id);
	List<JournalEntry> getAll();
}
