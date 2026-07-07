package com.example.unbind.domain;

import lombok.Data;
import java.util.List;

@Data
public class RelationshipReport {
	private String tag;
	private int entryCount;
	private int actionItemCount;
	private int completedCount;
	private int goodCount;
	private int neutralCount;
	private int hardCount;
	private String insight;
	private List<JournalEntry> entries;
}
