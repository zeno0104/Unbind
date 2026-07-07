package com.example.unbind.domain;

import lombok.Data;
import java.util.List;

@Data
public class ActionOptionsResponse {
	private List<ActionOption> options;
}