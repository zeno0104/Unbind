package com.example.unbind.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ForestScrap {
	private Long id;

	@JsonIgnore
	private Long userId;

	private Long forestKnotId;
	private String memo;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	// joined display fields, populated only when listing "my scraps"
	private String tag;
	private String situationSummary;
	private String actionText;
	private int reactionCount;
	private LocalDateTime knotCreatedAt;
}
