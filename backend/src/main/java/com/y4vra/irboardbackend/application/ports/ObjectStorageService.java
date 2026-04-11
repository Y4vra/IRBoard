package com.y4vra.irboardbackend.application.ports;

import java.io.InputStream;

public interface ObjectStorageService {
    String getDownloadUrl(String objectName);
    void uploadFile(String objectName, InputStream inputStream, long size, String contentType);
    void deleteFile(String objectName);
}