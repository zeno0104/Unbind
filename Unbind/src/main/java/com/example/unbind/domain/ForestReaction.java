package com.example.unbind.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ForestReaction {
	private Long id;

	@JsonIgnore
	private Long forestKnotId;

	@JsonIgnore
	private Long userId;

	private String actionText;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	private boolean mine;
}
