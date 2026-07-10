package com.example.unbind.domain;

import lombok.Data;

@Data
public class RelationshipInsightCache {
	private Long userId;
	private String tag;
	private int entryCount;
	private int completedCount;
	private String insightText;
}
