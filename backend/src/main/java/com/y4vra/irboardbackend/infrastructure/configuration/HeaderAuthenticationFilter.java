package com.y4vra.irboardbackend.infrastructure.configuration;

import com.y4vra.irboardbackend.domain.repositories.UserRepository;
import com.y4vra.irboardbackend.infrastructure.clients.KetoClient;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class HeaderAuthenticationFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final KetoClient ketoClient;

    public HeaderAuthenticationFilter(UserRepository userRepository, KetoClient ketoClient) {
        this.userRepository = userRepository;
        this.ketoClient = ketoClient;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        System.out.println("DEBUG: URI " + request.getRequestURI());
        System.out.println("DEBUG: X-User Header -> " + request.getHeader("X-User"));

        String oryId = request.getHeader("X-User");

        if (oryId != null && !oryId.isEmpty()) {

            userRepository.findByOryId(oryId).ifPresent(user -> {
                List<GrantedAuthority> authorities = new ArrayList<>();
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                boolean isAdmin = ketoClient.check("System", "main", "admins", oryId);
                if (isAdmin) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                }
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(user, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(auth);
            });
        }else{
            System.out.println("ALERT: Request without X-User. No authentication provided.");
        }

        filterChain.doFilter(request, response);
    }
}