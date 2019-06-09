import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {CommonService} from "./common.service";

@Pipe({
  name: 'formatDateString'
})

@Injectable()
export class FormatDateString implements PipeTransform {

  constructor(
    private commonService: CommonService
  ) {}

  transform(value: any, args?: any): any {
    let options = {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      year: 'numeric'
    };
    let locale = this.commonService.isEnglishLocale ? 'en' : 'ru';
    return this.commonService.capitalize(new Date(value).toLocaleDateString(locale, options));
  }

}
