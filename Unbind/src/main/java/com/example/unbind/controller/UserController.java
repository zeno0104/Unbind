package com.example.unbind.controller;

import com.example.unbind.domain.User;
import com.example.unbind.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
	private final UserMapper userMapper;

	@GetMapping("/me")
	public User me(Authentication authentication) {
		return userMapper.findByEmail(authentication.getName());
	}

	@PostMapping("/subscribe")
	public User subscribe(Authentication authentication) {
		User user = userMapper.findByEmail(authentication.getName());
		userMapper.updateIsPro(user.getId(), 1);
		user.setIsPro(1);
		return user;
	}
}
