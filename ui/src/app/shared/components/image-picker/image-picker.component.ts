import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import {FileService} from '../../services/file.service';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss']
})
export class ImagePickerComponent implements OnInit {
  @Input() initSrc: string;
  @Input() width = '425px';
  @Input() height = '250px';
  @Output() imageChange = new EventEmitter<string>();

  imageSrc: string;

  constructor(private fileService: FileService) { }

  ngOnInit(): void {
    this.imageSrc = this.initSrc;
  }

  pickImage(event: any): void {
    if (event.target.files && event.target.files[0]) {
      this.fileService.upload(event.target.files[0])
        .subscribe(file => {
          this.imageSrc = file;
          this.imageChange.emit(file);
        });
    }
  }
}
