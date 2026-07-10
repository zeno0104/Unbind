package com.example.unbind.controller;

import com.example.unbind.domain.User;
import com.example.unbind.exception.AppException;
import com.example.unbind.mapper.UserMapper;
import com.example.unbind.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
	private static final int NAME_CHANGE_COOLDOWN_DAYS = 30;
	private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

	private final UserMapper userMapper;
	private final UserService userService;

	@Value("${admin.email}")
	private String adminEmail;

	@GetMapping("/me")
	public User me(Authentication authentication) {
		User user = userMapper.findByEmail(authentication.getName());
		user.setAdmin(adminEmail.equalsIgnoreCase(user.getEmail()));
		return user;
	}

	@PatchMapping("/me/name")
	public User updateName(Authentication authentication, @RequestBody NameRequest request) {
		if (request.getName() == null || request.getName().isBlank()) {
			throw new AppException(HttpStatus.BAD_REQUEST, "닉네임을 입력해주세요.");
		}

		User user = userMapper.findByEmail(authentication.getName());

		if (user.getNameChangedAt() != null) {
			LocalDateTime nextAllowed = user.getNameChangedAt().plusDays(NAME_CHANGE_COOLDOWN_DAYS);
			if (LocalDateTime.now().isBefore(nextAllowed)) {
				throw new AppException(HttpStatus.TOO_MANY_REQUESTS,
						"닉네임은 " + nextAllowed.format(DATE_FORMAT) + " 이후에 다시 바꿀 수 있어요.");
			}
		}

		String trimmed = request.getName().trim();
		userMapper.updateName(user.getId(), trimmed);
		user.setName(trimmed);
		user.setNameChangedAt(LocalDateTime.now());
		return user;
	}

	@DeleteMapping("/me")
	public void deleteAccount(Authentication authentication) {
		userService.deleteAccount(authentication.getName());
	}

	@Data
	public static class NameRequest {
		private String name;
	}
}
