package com.example.unbind.domain;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ActionItem {
	private Long id;
	private Long entryId;
	private String content;
	private Integer isCompleted;
	private String feedback;
	private LocalDateTime entryCreatedAt;
	private String relationshipTag;
}