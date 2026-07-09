package com.example.unbind.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.unbind.domain.User;

@Mapper
public interface UserMapper {

	void insert(User user);

	User findByEmail(String email);

	void updateName(@Param("id") Long id, @Param("name") String name);

}
