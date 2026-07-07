package com.example.unbind.domain;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
	private Long id;
	private String email;
	private String password;
	private String name;
	private LocalDateTime createdAt;
	private Integer isPro;
}
