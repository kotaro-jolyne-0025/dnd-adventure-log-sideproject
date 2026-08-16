package com.dndadvlog.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import com.dndadvlog.backend.mapper.UserMapper;
import com.dndadvlog.backend.entity.User;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
@ActiveProfiles("local")
class BackendApplicationTests {

    @Autowired(required = false)
    private UserMapper userMapper;

    @Autowired(required = false)
    private PasswordEncoder passwordEncoder;

    @Test
    void testUserInDatabase() {
        if (userMapper != null) {
            User user = userMapper.findByEmail("wang.kv25@gmail.com");
            System.out.println(">>> FOUND_USER: " + user);
            if (user != null && passwordEncoder != null) {
                boolean matches = passwordEncoder.matches("kevin567", user.getPasswordHash());
                System.out.println(">>> PASSWORD_MATCHES: " + matches);
            }
        }
    }
}
