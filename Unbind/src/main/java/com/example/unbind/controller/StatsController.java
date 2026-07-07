package com.example.unbind.controller;

import com.example.unbind.mapper.UserMapper;
import com.example.unbind.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
public class StatsController {
	private final StatsService statsService;
	private final UserMapper userMapper;

	@GetMapping("/warmth")
	public Map<String, Object> getWarmth(Authentication authentication) {
		Long userId = userMapper.findByEmail(authentication.getName()).getId();
		return statsService.getWarmthStats(userId);
	}
}