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
  @Output() imageChange = new EventEmitter<File>();

  imageSrc: string | ArrayBuffer;

  constructor() { }

  ngOnInit(): void {
    this.imageSrc = this.initSrc;
  }

  pickImage(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = e => this.imageSrc = e.target.result;
      reader.readAsDataURL(event.target.files[0]);
      this.imageChange.emit(event.target.files[0]);
    }
  }
}
