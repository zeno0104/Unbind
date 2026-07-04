package com.example.unbind.domain;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JournalEntry {
	private long id;
	private String situationText;
	private LocalDateTime createdAt;
	
}
