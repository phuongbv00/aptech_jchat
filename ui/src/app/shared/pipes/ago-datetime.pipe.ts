import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'agoDatetime'
})
export class AgoDatetimePipe implements PipeTransform {

  transform(value: Date, ...args: unknown[]): string {
    const diff = new Date().getTime() - value.getTime();
    if (diff < 60 * 1000) {
      return 'now';
    } else if (diff < 60 * 60 * 1000) {
      return Math.round(diff / (60 * 1000)) + 'm';
    } else if (diff < 24 * 60 * 60 * 1000) {
      return Math.round(diff / (60 * 60 * 1000)) + 'h';
    } else if (diff < 30 * 24 * 60 * 60 * 1000) {
      return Math.round(diff / (24 * 60 * 60 * 1000)) + 'd';
    } else if (diff < 12 * 30 * 24 * 60 * 60 * 1000) {
      return Math.round(diff / (30 * 24 * 60 * 60 * 1000)) + 'M';
    }
    return 'y';
  }

}
