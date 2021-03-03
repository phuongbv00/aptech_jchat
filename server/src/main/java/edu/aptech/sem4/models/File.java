package edu.aptech.sem4.models;

import lombok.Data;
import lombok.ToString;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "files")
@Data
@ToString
public class File {
    @Id
    @GeneratedValue
    private Long id;
    private String name;
    private String type;
    private long size;
}
