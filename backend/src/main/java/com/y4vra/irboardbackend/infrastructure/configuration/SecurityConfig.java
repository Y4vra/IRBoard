package com.y4vra.irboardbackend.infrastructure.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final HeaderAuthenticationFilter headerFilter;

    public SecurityConfig(HeaderAuthenticationFilter headerFilter) {
        System.out.println("DEBUG: ¡SecurityConfig CARGADO EXITOSAMENTE!"); // <--- SI NO VES ESTO, SPRING NO ESTÁ LEYENDO ESTE ARCHIVO
        this.headerFilter = headerFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().authenticated()
                )
                .addFilterBefore(headerFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}