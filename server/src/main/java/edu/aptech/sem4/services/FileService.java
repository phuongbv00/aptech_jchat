package edu.aptech.sem4.services;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileService {
    void init();
    String save(MultipartFile file);
    Resource load(String filename);
}
