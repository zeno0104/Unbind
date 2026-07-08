package com.example.unbind.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class User {
	private Long id;
	private String email;

	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	private String password;

	private String name;
	private LocalDateTime createdAt;
	private Integer isPro;
	private LocalDateTime nameChangedAt;
	private boolean admin;
}
