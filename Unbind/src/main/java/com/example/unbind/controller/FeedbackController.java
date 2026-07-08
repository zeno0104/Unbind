package com.example.unbind.controller;

import com.example.unbind.domain.Feedback;
import com.example.unbind.domain.User;
import com.example.unbind.exception.AppException;
import com.example.unbind.mapper.FeedbackMapper;
import com.example.unbind.mapper.UserMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feedback")
@RequiredArgsConstructor
public class FeedbackController {
	private final FeedbackMapper feedbackMapper;
	private final UserMapper userMapper;

	@Value("${admin.email}")
	private String adminEmail;

	@PostMapping
	public void submit(Authentication authentication, @RequestBody FeedbackRequest request) {
		if (request.getContent() == null || request.getContent().isBlank()) {
			throw new AppException(HttpStatus.BAD_REQUEST, "피드백 내용을 입력해주세요.");
		}
		User user = userMapper.findByEmail(authentication.getName());

		Feedback feedback = new Feedback();
		feedback.setUserId(user.getId());
		feedback.setContent(request.getContent().trim());
		feedbackMapper.insert(feedback);
	}

	@GetMapping
	public List<Feedback> getAll(Authentication authentication) {
		if (!adminEmail.equalsIgnoreCase(authentication.getName())) {
			throw new AppException(HttpStatus.FORBIDDEN, "관리자만 볼 수 있어요.");
		}
		return feedbackMapper.findAllWithUserEmail();
	}

	@Data
	public static class FeedbackRequest {
		private String content;
	}
}
