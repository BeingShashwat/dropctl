package com.xanthos.dropctl.common.exception;

public class DropNotFoundException extends RuntimeException {
    public DropNotFoundException() {
        super("Drop not found");
    }
}
