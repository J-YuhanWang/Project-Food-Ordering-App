package io.github.j_yuhanwang.food_ordering_app.security;/*
 * @author BlairWang
 * @Date 28/12/2025 12:07 pm
 * @Version 1.0
 */

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        //extract token from request header's authourization part,begin with index of 7
        String token = getTokenFromRequest(request);

        if(token != null){

            try{
                String email = jwtUtils.getUsernameFromToken(token);
                String tokenType = jwtUtils.extractTokenType(token);
                if(StringUtils.hasText(email) && "access".equals(tokenType)){
                    List<GrantedAuthority> authorities = jwtUtils.extractRoles(token)
                            .stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList());

                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(email,null,authorities);

                    authenticationToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                }

            }catch(Exception ex){
                AuthenticationException authenticationException = new BadCredentialsException(ex.getMessage()); //401
                //lack of token/ invalid token
                customAuthenticationEntryPoint.commence(request,response,authenticationException);
                return;
            }

        }

        try{
            filterChain.doFilter(request,response);
        }catch (Exception ex){
            log.error(ex.getMessage());
        }
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String tokenWithBearer = request.getHeader("Authorization");
        if(tokenWithBearer!=null && tokenWithBearer.startsWith("Bearer")){
            return tokenWithBearer.substring(7);//"Bearer " extract the token from the index of 7
        }
        return null;
    }
}
