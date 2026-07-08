package com.example.unbind.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ForestKnot {
	private Long id;

	@JsonIgnore
	private Long userId;

	@JsonIgnore
	private Long actionItemId;

	private String tag;
	private String situationSummary;
	private String actionText;
	private LocalDateTime createdAt;
	private int reactionCount;
	private int scrapCount;

	private boolean mine;
	private boolean scrapped;
}
