import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localDatetime'
})
export class LocalDatetimePipe implements PipeTransform {

  transform(value: number[], ...args: unknown[]): Date {
    return new Date(value[0], value[1] - 1, value[2], value[3], value[4], value[5]);
  }

}
