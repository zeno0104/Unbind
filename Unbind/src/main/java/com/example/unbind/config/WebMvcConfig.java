package com.example.unbind.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

	private final ClaudeRateLimitInterceptor claudeRateLimitInterceptor;

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(claudeRateLimitInterceptor).addPathPatterns("/entries/*/conversation/**",
				"/entries/*/conclude", "/insights/**");
	}
}
