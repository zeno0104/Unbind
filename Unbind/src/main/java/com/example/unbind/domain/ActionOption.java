package com.example.unbind.domain;

import lombok.Data;

@Data
public class ActionOption {
	private String trigger;
	private String action;
	private String reason;
}