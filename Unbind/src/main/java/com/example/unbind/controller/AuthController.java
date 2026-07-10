package com.example.unbind.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.unbind.domain.User;
import com.example.unbind.service.AuthService;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService service;


	@PostMapping("/signup")
	public User signup(@RequestBody User user) {
		return service.signup(user);
	}

	@PostMapping("/login")
	public String login(@RequestBody User loginRequest) {
		return service.login(loginRequest.getEmail(), loginRequest.getPassword());
	}

	@PostMapping("/password-reset/request")
	public Map<String, String> requestPasswordReset(@RequestBody PasswordResetRequest request) {
		service.requestPasswordReset(request.getEmail());
		return Map.of("message", "입력하신 이메일로 재설정 링크를 보냈어요. 메일함을 확인해주세요.");
	}

	@PostMapping("/password-reset/confirm")
	public Map<String, String> confirmPasswordReset(@RequestBody PasswordResetConfirmRequest request) {
		service.confirmPasswordReset(request.getToken(), request.getNewPassword());
		return Map.of("message", "비밀번호가 변경됐어요. 새 비밀번호로 로그인해주세요.");
	}

	@Data
	public static class PasswordResetRequest {
		private String email;
	}

	@Data
	public static class PasswordResetConfirmRequest {
		private String token;
		private String newPassword;
	}
}
