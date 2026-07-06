package com.example.unbind.domain;

import lombok.Data;

@Data
public class ActionItem {
	private Long id;
	private Long entryId;
	private String content;
	private Integer isCompleted;
}