package com.example.unbind.domain;

import lombok.Data;
import java.util.List;

@Data
public class PatternInsightResponse {
	private List<PatternInsight> patterns;
}
