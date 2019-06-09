import { Pipe, PipeTransform } from '@angular/core';
import {TranslationService} from "./translation-service.service";

@Pipe({
  name: 'translatePhrase'
})
export class TranslatePhrasePipe implements PipeTransform {

  constructor(private translationService : TranslationService) {}

  transform(value: any, args?: any): any {
    return this.translationService.phrases[value] || value;
  }

}
