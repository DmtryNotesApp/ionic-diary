import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'formatDateString'
})

@Injectable()
export class FormatDateString implements PipeTransform {

  constructor() {}

  transform(value: any, args?: any): any {
    return new Date(value).toDateString();
  }

}
