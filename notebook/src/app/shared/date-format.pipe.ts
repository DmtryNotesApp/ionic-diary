import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {CommonService} from "./common.service";

@Pipe({
  name: 'dateFormat'
})

@Injectable()
export class DateFormatPipe implements PipeTransform {

  constructor(private commonService: CommonService) {}

  transform(value: any, args?: any): any {
    let date: string;
    if (value) {
      date = this.commonService.getOutputDate(value);
    }
    return date;
  }

}
