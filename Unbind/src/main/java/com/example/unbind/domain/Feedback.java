package com.example.unbind.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Feedback {
	private Long id;

	@JsonIgnore
	private Long userId;

	private String content;
	private LocalDateTime createdAt;

	private String userEmail;
	private String userName;
}
