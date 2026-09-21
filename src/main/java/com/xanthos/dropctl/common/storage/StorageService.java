package com.xanthos.dropctl.common.storage;

import java.io.InputStream;

public interface StorageService {
    String store(InputStream content, long sizeBytes, String contentType);

    InputStream load(String key);

    void delete(String key);
}