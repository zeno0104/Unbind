package com.example.unbind.domain;

import lombok.Data;

@Data
public class PushSubscription {
	private Long id;
	private Long userId;
	private String endpoint;
	private String p256dh;
	private String auth;
}
