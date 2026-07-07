package com.example.unbind.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Instant;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@Component
public class ClaudeRateLimitInterceptor implements HandlerInterceptor {

	@Value("${ratelimit.claude.per-user-per-hour}")
	private int perUserPerHour;

	@Value("${ratelimit.claude.global-per-day}")
	private int globalPerDay;

	private final ConcurrentHashMap<String, Deque<Instant>> perUserRequests = new ConcurrentHashMap<>();
	private final Deque<Instant> globalRequests = new ConcurrentLinkedDeque<>();

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {
		Instant now = Instant.now();

		synchronized (globalRequests) {
			globalRequests.removeIf(t -> t.isBefore(now.minusSeconds(86400)));
			if (globalRequests.size() >= globalPerDay) {
				return reject(response, "오늘 사용량이 많아서 잠시 후 다시 시도해주세요.");
			}
		}

		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		String key = auth != null ? auth.getName() : request.getRemoteAddr();
		Deque<Instant> userRequests = perUserRequests.computeIfAbsent(key, k -> new ConcurrentLinkedDeque<>());
		synchronized (userRequests) {
			userRequests.removeIf(t -> t.isBefore(now.minusSeconds(3600)));
			if (userRequests.size() >= perUserPerHour) {
				return reject(response, "잠시 쉬었다가 다시 시도해주세요.");
			}
			userRequests.add(now);
		}

		synchronized (globalRequests) {
			globalRequests.add(now);
		}
		return true;
	}

	private boolean reject(HttpServletResponse response, String message) throws java.io.IOException {
		response.setStatus(429);
		response.setContentType("application/json;charset=UTF-8");
		response.getWriter().write("{\"message\":\"" + message + "\"}");
		return false;
	}
}
