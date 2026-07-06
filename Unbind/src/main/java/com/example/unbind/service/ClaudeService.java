package com.example.unbind.service;

import com.example.unbind.domain.ClaudeRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class ClaudeService {

	private final RestClient restClient;
	private final ObjectMapper objectMapper = new ObjectMapper();

	public ClaudeService(@Value("${anthropic.api.key}") String apiKey) {
		this.restClient = RestClient.builder().baseUrl("https://api.anthropic.com/v1/messages")
				.defaultHeader("x-api-key", apiKey).defaultHeader("anthropic-version", "2023-06-01")
				.defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE).build();
	}

	public String ask(String userPrompt) {
		ClaudeRequest request = new ClaudeRequest("claude-sonnet-4-6", 1024,
				List.of(new ClaudeRequest.Message("user", userPrompt)));

		String responseBody = restClient.post().body(request).retrieve().body(String.class);

		try {
			JsonNode root = objectMapper.readTree(responseBody);
			return root.get("content").get(0).get("text").asText();
		} catch (Exception e) {
			throw new RuntimeException("Claude 응답 파싱 실패", e);
		}
	}
}