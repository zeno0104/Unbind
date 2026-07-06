package com.example.unbind.service;

import com.example.unbind.domain.ActionItemResponse;
import com.example.unbind.domain.ClaudeRequest;
import com.example.unbind.domain.FragmentResponse;
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

	public FragmentResponse splitIntoFragments(String situationText) {
		String prompt = """
				당신은 심리 상담 보조 도구입니다.
				사용자가 겪은 상황을 읽고, 그 상황을 구성하는 서로 다른 생각/요소 3~4개로 나눠주세요.
				각 조각은 8단어 이내의 짧은 문장으로 표현하세요.
				반드시 아래 JSON 형식으로만 응답하세요. 다른 설명은 절대 추가하지 마세요.

				{"fragments": ["조각1", "조각2", "조각3", "조각4"]}

				상황: "%s"
				""".formatted(situationText);

		String responseText = ask(prompt);
		return parseJson(responseText, FragmentResponse.class);
	}

	public ActionItemResponse suggestActionItem(String heldItems) {
		String prompt = """
				사용자가 아래 항목들을 "내 손 안(내가 통제할 수 있는 것)"으로 분류했습니다.

				%s

				이 중에서, 사용자가 오늘 바로 실천할 수 있는 구체적인 행동 하나를 15단어 이내로 제안하세요.
				반드시 아래 JSON 형식으로만 응답하세요. 다른 설명은 절대 추가하지 마세요.

				{"actionItem": "제안 문장"}
				""".formatted(heldItems);

		String responseText = ask(prompt);
		return parseJson(responseText, ActionItemResponse.class);
	}

	private <T> T parseJson(String text, Class<T> clazz) {
		try {
			return objectMapper.readValue(text, clazz);
		} catch (Exception e) {
			throw new RuntimeException("Claude 응답 JSON 파싱 실패: " + text, e);
		}
	}
}