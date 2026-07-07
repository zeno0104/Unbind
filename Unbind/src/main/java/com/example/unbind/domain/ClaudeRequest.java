package com.example.unbind.domain;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ClaudeRequest {
	private String model;
	private int max_tokens;
	private String system;
	private List<Message> messages;

	public ClaudeRequest(String model, int max_tokens, List<Message> messages) {
		this.model = model;
		this.max_tokens = max_tokens;
		this.messages = messages;
	}

	public ClaudeRequest(String model, int max_tokens, String system, List<Message> messages) {
		this.model = model;
		this.max_tokens = max_tokens;
		this.system = system;
		this.messages = messages;
	}

	@Data
	@NoArgsConstructor
	public static class Message {
		private String role;
		private String content;

		public Message(String role, String content) {
			this.role = role;
			this.content = content;
		}
	}
}