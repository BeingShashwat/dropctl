package com.xanthos.dropctl.common.exception;

public class SlugTakenException extends RuntimeException {
    public SlugTakenException(String slug) {
        super("The slug '" + slug + "' is already taken");
    }
}
