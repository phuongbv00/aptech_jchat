import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {
  @Input() src: string;
  @Input() size: string;
  @Input() isGroup = false;

  icon: string;
  styleImg: any;
  styleIcon: any;

  constructor() { }

  ngOnInit(): void {
    this.icon = this.isGroup ? 'people-outline' : 'person-outline';
    this.styleImg = {
      'border-radius': '50%',
      width: this.size,
      height: this.size,
    };
    this.styleIcon = {
      ...this.styleImg,
    };
  }

}
