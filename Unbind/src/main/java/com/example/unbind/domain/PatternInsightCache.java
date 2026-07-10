package com.example.unbind.domain;

import lombok.Data;

@Data
public class PatternInsightCache {
	private Long userId;
	private int entryCount;
	private int completedCount;
	private String patternsJson;
}
