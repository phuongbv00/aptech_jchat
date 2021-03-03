package edu.aptech.sem4.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Objects;
import java.util.Random;

@Service
@Slf4j
public class FileServiceImpl implements FileService {
    private final Path root = Paths.get("uploads");

    @Override
    @PostConstruct
    public void init() {
        try {
            Files.createDirectory(root);
        } catch (IOException e) {
            log.warn("Could not initialize folder for upload or folder exists");
        }
    }

    @Override
    public String save(MultipartFile file) {
        try {
            var filename = generateFileName(Objects.requireNonNull(file.getOriginalFilename()));
            Files.copy(file.getInputStream(), root.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            return filename;
        } catch (Exception e) {
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage());
        }
    }

    @Override
    public Resource load(String filename) {
        try {
            var resource = new UrlResource(root.resolve(filename).toUri());

            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read the file!");
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }

    private String generateFileName(String originName) {
        var now =  String.valueOf(Instant.now().toEpochMilli());
        var random = String.format("%06d", new Random().nextInt(999999));
        return now.concat(random).concat(originName.replace(" ", ""));
    }
}
