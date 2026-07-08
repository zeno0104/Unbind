package com.example.unbind.domain;

import lombok.Data;

@Data
public class ReactionModerationResult {
	private boolean approved;
	private String actionText;
}
