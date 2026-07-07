package com.example.unbind.controller;

import com.example.unbind.domain.PatternInsightResult;
import com.example.unbind.domain.RelationshipReport;
import com.example.unbind.service.InsightService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/insights")
@RequiredArgsConstructor
public class InsightController {
	private final InsightService insightService;

	@GetMapping("/patterns")
	public PatternInsightResult getPatterns(Authentication authentication) {
		return insightService.getPatterns(authentication.getName());
	}

	@GetMapping("/relationships")
	public List<RelationshipReport> getRelationshipReports(Authentication authentication) {
		return insightService.getRelationshipReports(authentication.getName());
	}
}
