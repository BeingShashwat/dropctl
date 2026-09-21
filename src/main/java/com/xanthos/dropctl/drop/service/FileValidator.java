package com.xanthos.dropctl.drop.service;

import com.xanthos.dropctl.common.config.UploadProperties;
import com.xanthos.dropctl.common.exception.InvalidFileException;
import com.xanthos.dropctl.common.exception.UnsupportedFileTypeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.TreeSet;

@Slf4j
@Component
@RequiredArgsConstructor
public class FileValidator {

    private static final int MAX_FILE_NAME_LENGTH = 255;

    private final UploadProperties properties;
    private final Tika tika = new Tika();

    public record ValidatedFile(String originalFileName, String extension, String contentType) {
    }

    public ValidatedFile validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("File is empty");
        }

        String fileName = sanitizeFileName(file.getOriginalFilename());
        String extension = extensionOf(fileName);

        List<String> acceptedTypes = properties.allowedTypes().get(extension);
        if (acceptedTypes == null) {
            throw new UnsupportedFileTypeException(
                    "File type is not supported. Allowed: " + String.join(", ", new TreeSet<>(properties.allowedTypes().keySet())));
        }

        String detected = detect(file);
        if (!acceptedTypes.contains(detected)) {
            log.warn("Rejected upload: extension={} detectedType={}", extension, detected);
            throw new UnsupportedFileTypeException("File content does not match its extension");
        }

        return new ValidatedFile(fileName, extension, acceptedTypes.get(0));
    }

    private String detect(MultipartFile file) {
        try (InputStream in = file.getInputStream()) {
            return tika.detect(in);
        } catch (IOException e) {
            throw new InvalidFileException("Could not read the uploaded file");
        }
    }

    private String extensionOf(String fileName) {
        int dot = fileName.lastIndexOf('.');
        if (dot <= 0 || dot == fileName.length() - 1) {
            throw new UnsupportedFileTypeException("File must have an extension");
        }
        return fileName.substring(dot + 1).toLowerCase();
    }

    private String sanitizeFileName(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new InvalidFileException("File name is missing");
        }
        String name = StringUtils.getFilename(StringUtils.cleanPath(raw));
        if (name == null) {
            throw new InvalidFileException("File name is invalid");
        }
        name = name.replaceAll("\\p{Cntrl}", "").trim();
        if (name.isEmpty()) {
            throw new InvalidFileException("File name is invalid");
        }
        return name.length() > MAX_FILE_NAME_LENGTH ? name.substring(0, MAX_FILE_NAME_LENGTH) : name;
    }
}