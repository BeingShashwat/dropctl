package com.xanthos.dropctl.drop.service;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class SlugGenerator {
    static final int LENGTH = 5;
    private static final char[] ALPHABET = "abcdefghijklmnopqrstuvwxyz".toCharArray();

    private final SecureRandom random = new SecureRandom();

    public String generate(){
        char[] slug = new char[LENGTH];
        for(int i = 0; i < LENGTH; i++) slug[i] = ALPHABET[random.nextInt(ALPHABET.length)];
        return new String(slug);
    }
}
