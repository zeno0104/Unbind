package com.example.unbind.mapper;

import com.example.unbind.domain.ConstellationName;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ConstellationNameMapper {
	List<ConstellationName> findAllByUserId(Long userId);

	void upsert(@Param("userId") Long userId, @Param("tag") String tag, @Param("name") String name);
}
