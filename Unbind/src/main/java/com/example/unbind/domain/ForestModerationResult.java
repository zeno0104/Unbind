package com.example.unbind.domain;

import lombok.Data;

@Data
public class ForestModerationResult {
	private boolean approved;
	private String situationSummary;
	private String actionText;
	private String relationshipCategory;
}
