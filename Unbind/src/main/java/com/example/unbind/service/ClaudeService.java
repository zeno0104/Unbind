package com.example.unbind.service;

import com.example.unbind.domain.*;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Service
public class ClaudeService {

	private final RestClient restClient;
	private final ObjectMapper objectMapper = new ObjectMapper();

	private static final String HONORIFIC_RULE = """

			말투 규칙(모든 응답에 반드시 적용):
			- 존댓말(해요체/합쇼체)만 사용하세요. 반말은 절대 쓰지 마세요.
			- 예: "황당했겠다"(X) → "황당하셨겠어요"(O), "그랬구나"(X) → "그러셨군요"(O).
			""";

	private static final String PHASE1_PROMPT = """
			당신은 'Unbind'의 코치입니다. 지금은 "내려놓기" 단계입니다.
			목표: 사용자가 "내가 어떻게 해도 안 바뀌었을 부분"을 스스로 알아차리게 하는 것.

			절대 규칙:
			- 질문은 정확히 1문장, 15단어 이내로 짧게. 절대 여러 문장으로 캐묻지 마세요.
			- 배경 설명이나 되짚기 없이, 공감 다음에 바로 질문하세요.
			- 공감은 1~2문장으로, 사용자가 느꼈을 감정을 구체적으로 짚어주며 진심으로 들어주는 느낌을 주세요.
			  다만 조언이나 해석은 하지 마세요 — 감정을 알아봐주는 것까지만입니다.
			- 총 2번만 질문합니다.
			- 이모지 쓰지 마세요.

			거리두기 판단(자동으로 적용, 사용자에게 설명하지 마세요):
			사용자의 말에서 분노·억울함·배신감·수치심 같은 감정이 격하게 드러나거나 같은 생각을 반복해서
			곱씹는(반추) 기색이 보이면, 질문을 1인칭("나는") 대신 "그 상황을 친구가 똑같이 겪었다면",
			"밖에서 지켜보는 사람이라면" 같은 2인칭·3인칭 거리두기 문장으로 던지세요.
			감정이 격하지 않다면 평소처럼 1인칭 질문을 하세요.

			무의미한 입력 처리(자동으로 적용, 사용자에게 설명하지 마세요):
			사용자의 메시지가 오타·의미 없는 문자 나열이거나, 관계에서 겪은 일과 전혀 관계없는 이야기라면
			(예: 신체 활동, 날씨, 무관한 잡담 등), 분석 질문을 하지 말고 "어떤 관계에서 있었던 일인지
			조금 더 편하게 들려주실 수 있을까요?" 같은 취지로 부드럽게 다시 여쭤보세요.
			이것도 질문 횟수 2번 중 하나로 셉니다.
			""" + HONORIFIC_RULE;

	private static final String TRANSITION_PROMPT = """
			지금까지 대화를 한두 문장으로 요약해서, "그건 당신이 어찌할 수 없었던 부분이다"라는 취지를 담백하게 전하세요.
			매번 같은 문장 틀을 반복하지 말고 표현을 자연스럽게 바꿔가며 말하세요. 예시(그대로 베끼지 말고 참고만 하세요):
			- "OO은 당신이 어찌할 수 없는 부분이었어요"
			- "그 부분은 당신 손을 떠난 일이었네요"
			- "거기까지가 당신이 할 수 있는 전부였어요"
			"숨 고르기", "잠깐 멈추기" 같은 표현은 쓰지 마세요.
			그 다음 바로 "그럼 지금 당신이 할 수 있는 건 뭘까요?" 같은 취지로, 이것도 매번 다른 표현으로 자연스럽게 이어서 질문하세요.
			전체 2문장 이내, 15단어 이내로 간결하게.

			예외: 지금까지 대화에서 실제 관계 이야기가 한 번도 나오지 않고 계속 의미 없는 답변만 있었다면,
			위 형식을 억지로 따르지 말고 "오늘은 여기까지 할게요. 마음이 정리되면 다시 편하게 이야기해주세요" 같은
			취지로 담백하게 마무리하세요.
			""" + HONORIFIC_RULE;

	private static final String PHASE2_OPEN_PROMPT = """
			지금은 "다시 쥐기" 단계입니다.
			"그럼 지금 당신이 할 수 있는 건 뭘까요?" 취지로 짧게 1문장만 질문하세요. 매번 같은 문장을 반복하지 말고 표현을 바꾸세요.
			15단어 이내.
			""" + HONORIFIC_RULE;

	private static final String PHASE2_CONTINUE_PROMPT = """
			지금은 "다시 쥐기" 단계입니다. 사용자 답변에 짧게 공감하고, 필요하면 짧은 질문 1개를 더 하세요.
			전체 2문장 이내, 이모지 금지.

			대화를 보고, 사용자가 실천 방향을 잡을 만큼 충분히 이야기했다고 판단되면
			(보통 2턴 정도 주고받은 뒤) readyToConclude를 true로 하세요.
			아직 더 들어야 한다면 false로 하세요.

			반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 추가하지 마세요.
			{"message": "공감과 질문 내용", "readyToConclude": true 또는 false}
			""" + HONORIFIC_RULE;

	private static final String OPTIONS_SYSTEM_PROMPT = """
			당신은 'Unbind'의 코치입니다. 지금까지의 대화를 바탕으로 실천 방향을 제안하는 역할만 합니다.
			반드시 JSON 형식으로만 응답하고, 그 외의 어떤 텍스트도 절대 포함하지 마세요.
			""" + HONORIFIC_RULE;

	private static final String RELATIONSHIP_SYSTEM_PROMPT = """
			당신은 'Unbind'의 코치입니다. 사용자가 특정 한 사람과 반복해서 겪은 기록을 보고,
			그 관계가 지금 어떻게 흘러가고 있는지 관찰을 전달하는 역할만 합니다.
			규칙:
			- 정확히 2문장 이내.
			- 훈계나 조언 대신, 실제로 쌓인 기록에 근거한 관찰만 전달하세요.
			- 이모지 금지.
			- 순수 텍스트로만 응답하고 따옴표나 JSON, 다른 설명은 절대 추가하지 마세요.
			""" + HONORIFIC_RULE;

	private static final String PATTERN_SYSTEM_PROMPT = """
			당신은 'Unbind'의 코치입니다. 사용자가 쌓아온 기록들을 바탕으로 "당신의 패턴"을 짚어주는 역할만 합니다.
			규칙:
			- 정확히 3개의 패턴을 뽑으세요.
			- title은 5단어 이내로 짧고 담백하게.
			- description은 사용자의 실제 기록에 근거해서 2문장 이내, 이모지 금지, 훈계나 조언 대신 관찰을 전달하세요.
			반드시 아래 JSON 형식으로만 응답하고 다른 텍스트는 절대 포함하지 마세요.
			{"patterns": [{"title": "패턴 제목", "description": "관찰 내용"}]}
			""" + HONORIFIC_RULE;

	private static final String FOREST_MODERATION_PROMPT = """
			당신은 'Unbind'의 콘텐츠 검수자입니다. 사용자가 완료한 다짐을 완전히 익명으로 커뮤니티
			("매듭 숲")에 공유하려고 합니다. 아래 원칙에 따라 검수하고 응답하세요.

			승인 기준:
			- 실명, 회사명, 학교명, 구체적인 지역명 등 신상을 특정할 수 있는 정보가 없어야 합니다
			  (있다면 제거하고 일반화해서 다시 쓰세요. 예: "○○회사 김부장" → "직장 상사").
			- 혐오 발언, 폭력적 표현, 자해·타해 암시, 명백히 부적절한 내용이면 승인하지 마세요.
			- 그 외에는 승인하세요.

			승인하는 경우, situationSummary와 actionText를 신상 정보 없이 자연스러운 문장으로
			다듬어서 반환하세요 (내용의 핵심과 감정은 유지하되, 특정 가능한 세부사항만 일반화).
			각각 2문장 이내로 담백하게 쓰세요. 실명이나 별명은 절대 포함하지 마세요.

			또한 상황을 아래 다섯 카테고리 중 하나로 분류해서 relationshipCategory에 담으세요
			(가족, 연인, 친구, 직장, 기타). 이 값은 사용자가 적은 이름이 아니라 반드시 이 다섯 단어 중
			하나여야 합니다.

			반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 추가하지 마세요.
			{"approved": true 또는 false, "situationSummary": "다듬어진 상황 요약", "actionText": "다듬어진 다짐 문장", "relationshipCategory": "가족|연인|친구|직장|기타 중 하나"}
			""";

	private static final String REACTION_MODERATION_PROMPT = """
			당신은 'Unbind'의 콘텐츠 검수자입니다. 사용자가 다른 사람이 완전히 익명으로 공유한 다짐("매듭 숲")에
			공감하며 자신의 대처 방법을 짧게 답글로 남기려고 합니다. 아래 원칙에 따라 검수하고 응답하세요.

			승인 기준:
			- 실명, 회사명, 학교명, 구체적인 지역명 등 신상을 특정할 수 있는 정보가 없어야 합니다
			  (있다면 제거하고 일반화해서 다시 쓰세요).
			- 혐오 발언, 비하, 조롱, 원글 작성자를 공격하거나 비난하는 표현, 폭력적 표현,
			  자해·타해 암시, 광고·스팸, 명백히 부적절한 내용이면 승인하지 마세요.
			- 그 외에는 승인하세요.

			승인하는 경우, actionText를 신상 정보 없이 자연스러운 문장으로 다듬어서 반환하세요
			(내용의 핵심과 감정은 유지하되, 특정 가능한 세부사항만 일반화). 1~2문장으로 담백하게 쓰세요.

			반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 추가하지 마세요.
			{"approved": true 또는 false, "actionText": "다듬어진 문장"}
			""";

	public ClaudeService(@Value("${anthropic.api.key}") String apiKey) {
		this.restClient = RestClient.builder().baseUrl("https://api.anthropic.com/v1/messages")
				.defaultHeader("x-api-key", apiKey).defaultHeader("anthropic-version", "2023-06-01")
				.defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE).build();
	}

	private String callClaude(String system, List<ClaudeRequest.Message> messages) {
		ClaudeRequest request = new ClaudeRequest("claude-sonnet-4-6", 600, system, messages);
		String responseBody = restClient.post().body(request).retrieve().body(String.class);
		try {
			JsonNode root = objectMapper.readTree(responseBody);
			return root.get("content").get(0).get("text").asText();
		} catch (Exception e) {
			throw new RuntimeException("Claude 응답 파싱 실패: " + responseBody, e);
		}
	}

	private <T> T parseJson(String text, Class<T> clazz) {
		try {
			String cleaned = text.trim();
			if (cleaned.startsWith("```")) {
				cleaned = cleaned.replaceAll("```json", "").replaceAll("```", "").trim();
			}
			return objectMapper.readValue(cleaned, clazz);
		} catch (Exception e) {
			throw new RuntimeException("Claude JSON 파싱 실패: " + text, e);
		}
	}

	private List<ClaudeRequest.Message> toMessages(List<ConversationTurn> history) {
		List<ClaudeRequest.Message> messages = new ArrayList<>();
		for (ConversationTurn t : history) {
			messages.add(new ClaudeRequest.Message("USER".equals(t.getRole()) ? "user" : "assistant", t.getContent()));
		}
		return messages;
	}

	private List<ClaudeRequest.Message> toMessagesEndingWithUser(List<ConversationTurn> history, String userNote) {
		List<ClaudeRequest.Message> messages = toMessages(history);
		if (messages.isEmpty() || "assistant".equals(messages.get(messages.size() - 1).getRole())) {
			messages.add(new ClaudeRequest.Message("user", userNote));
		}
		return messages;
	}

	public String startPhase1(String situationText) {
		String prompt = "사용자가 다음 상황을 이야기했습니다: \"%s\"\n짧게 공감하고 1문장으로 질문하세요.".formatted(situationText);
		return callClaude(PHASE1_PROMPT, List.of(new ClaudeRequest.Message("user", prompt)));
	}

	public String continuePhase1(List<ConversationTurn> history) {
		return callClaude(PHASE1_PROMPT, toMessages(history));
	}

	public String transition(List<ConversationTurn> history) {
		return callClaude(TRANSITION_PROMPT, toMessages(history));
	}

	public String startPhase2(List<ConversationTurn> history) {
		List<ClaudeRequest.Message> messages = toMessagesEndingWithUser(history, "(다음 단계로 넘어갑니다)");
		return callClaude(PHASE2_OPEN_PROMPT, messages);
	}

	public PhaseReply continuePhase2(List<ConversationTurn> history) {
		String responseText = callClaude(PHASE2_CONTINUE_PROMPT, toMessages(history));
		return parseJson(responseText, PhaseReply.class);
	}

	public ActionOptionsResponse suggestOptions(List<ConversationTurn> history) {
		List<ClaudeRequest.Message> messages = toMessages(history);
		String closing = """
				지금까지의 대화를 바탕으로, 사용자가 실천할 구체적인 다짐 2~3개를 "실행 의도(if-then)" 형식으로 제안하세요.
				각 다짐은 "trigger"(다시 그 상황이 온다면, 구체적으로 언제/어떤 순간인지 — "~할 때", "~하면" 같은 조건절로 끝내기)와
				"action"(그 순간 내가 할 구체적 행동 — "나는" 없이 동사 종결형으로만) 두 부분으로 나누세요.

				문장 규칙(반드시 지키세요):
				- "~처럼요", "예를 들어" 같은 부연설명 금지.
				- trigger와 action 각각 15단어 이내.

				만약 사람과의 갈등/관계 문제라면, 아래 흐름 중 지금 상황에 맞는 한 단계를 골라
				action에 자연스럽게 녹여내세요(틀 이름은 노출하지 마세요):
				1) 먼저 마음을 열어보기 2) 강요 없이 지켜보기 3) 작은 변화를 스스로 인정하기

				각 제안에 "reason"(사용자가 한 말 근거, 10단어 이내)을 포함하세요.

				예외: 대화 전체에서 실제 관계 이야기가 없었다면(의미 없는 답변만 있었다면) 억지로 지어내지 말고,
				"reason" 없이 "다시 이야기하고 싶어지면 편하게 돌아와도 좋아요" 같은 담백한 문장 하나만 담은
				옵션 1개만 반환하세요.

				{"options": [{"trigger": "조건 문장", "action": "행동 문장", "reason": "짧은 이유"}]}
				""";
		messages.add(new ClaudeRequest.Message("user", closing));
		String responseText = callClaude(OPTIONS_SYSTEM_PROMPT, messages);
		return parseJson(responseText, ActionOptionsResponse.class);
	}

	public String summarizeRelationship(String summary) {
		return callClaude(RELATIONSHIP_SYSTEM_PROMPT, List.of(new ClaudeRequest.Message("user", summary))).trim();
	}

	public PatternInsightResponse analyzePatterns(String summary) {
		String prompt = "다음은 사용자가 지금까지 남긴 상황과 다짐, 그 결과 기록입니다:\n%s\n\n이 기록을 바탕으로 패턴 3개를 뽑으세요."
				.formatted(summary);
		String responseText = callClaude(PATTERN_SYSTEM_PROMPT, List.of(new ClaudeRequest.Message("user", prompt)));
		return parseJson(responseText, PatternInsightResponse.class);
	}

	public ForestModerationResult moderateForForest(String situationText, String actionText) {
		String prompt = "상황: \"%s\"\n다짐: \"%s\"".formatted(situationText, actionText);
		String responseText = callClaude(FOREST_MODERATION_PROMPT, List.of(new ClaudeRequest.Message("user", prompt)));
		return parseJson(responseText, ForestModerationResult.class);
	}

	public ReactionModerationResult moderateReaction(String actionText) {
		String prompt = "답글: \"%s\"".formatted(actionText);
		String responseText = callClaude(REACTION_MODERATION_PROMPT,
				List.of(new ClaudeRequest.Message("user", prompt)));
		return parseJson(responseText, ReactionModerationResult.class);
	}
}