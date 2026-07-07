package com.example.unbind.domain;

import lombok.Data;

@Data
public class PhaseReply {
	private String message;
	private boolean readyToConclude;
}