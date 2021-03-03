package edu.aptech.sem4.controller;

import edu.aptech.sem4.services.FileService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("api/file")
@Slf4j
public class FileController {
    @Autowired
    private FileService fileService;

    @PostMapping("upload")
    public Object uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            log.info(file.toString());
            var filename = fileService.save(file);
            return new Object() {
                public String file = filename;
            };
        } catch (Exception ex) {
            log.error(ex.getMessage());
            return null;
        }
    }

    @GetMapping("{filename:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        try {
            var file = fileService.load(filename);
            var ext = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
            var mime = "";
            switch (ext) {
                case "png": mime = "image/png"; break;
                case "jpeg": mime = "image/jpeg"; break;
                case "jpg": mime = "image/jpg"; break;
                case "gif": mime = "image/gif"; break;
            }

            if (ext.isEmpty())
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                        .body(file);
            else
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_TYPE, mime)
                        .body(file);
        } catch (Exception ex) {
            return  ResponseEntity.notFound().build();
        }
    }
}
