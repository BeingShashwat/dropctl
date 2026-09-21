package com.xanthos.dropctl.common.exception;

public class DropExpiredException extends RuntimeException {
    public DropExpiredException() {
        super("This drop has expired");
    }
}
