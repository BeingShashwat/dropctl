package com.xanthos.dropctl.drop.service;

import com.xanthos.dropctl.common.exception.InvalidSlugException;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@Component
public class SlugValidator {
    private static final Pattern FORMAT = Pattern.compile("^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$");
    private static final Set<String> RESERVED = Set.of("api", "download", "actuator", "health", "admin", "qr", "static", "assets", "drops", "drop", "upload", "login", "auth", "www", "help");

    public String validateAndNormalize(String raw){
        if(raw == null || raw.isBlank()) throw new InvalidSlugException("Slug must not be blank");

        String slug = raw.trim().toLowerCase(Locale.ROOT);

        if(!FORMAT.matcher(slug).matches()) throw new InvalidSlugException("Slug must be 3-32 characters: letters, digits and hyphens, not starting or ending with a hyphen");

        if(RESERVED.contains(slug)) throw new InvalidSlugException("This slug is reserved");

        return slug;
    }

}
