package com.example.unbind.domain;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PasswordResetToken {
	private Long id;
	private Long userId;
	private String tokenHash;
	private LocalDateTime expiresAt;
	private LocalDateTime usedAt;
	private LocalDateTime createdAt;
}
