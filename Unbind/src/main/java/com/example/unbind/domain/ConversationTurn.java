package com.example.unbind.domain;

import lombok.Data;

@Data
public class ConversationTurn {
	private Long id;
	private Long entryId;
	private String role;
	private String content;
	private String stepType;
	private Integer turnOrder;
}