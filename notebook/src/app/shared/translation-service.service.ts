import { Injectable } from '@angular/core';
import {CommonService} from "./common.service";

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  language:string = localStorage.getItem('language');
  dictionary = {
    'No cases planned' : 'Нет записей',
    'Mark as Uncompleted': 'Возобновить',
    'Mark as Completed': 'Завершить',
    'View/Edit': 'Изменить',
    'Change Date': 'Перенести',
    'Delete': 'Удалить',
    'Cancel': 'Отмена',
    'None active cases left ': 'Нет активных дел ',
    'Active cases left': 'Активных дел',
    'Confirm Action': 'Отмена',
    'Are you sure you want to delete this case?': 'Удалить запись?',
    'Yes': 'Да',
    'No': 'Нет'
  };
  phrases = {};
  constructor(private commonService: CommonService) {
    for(let phrase in this.dictionary) {
      this.phrases[phrase] = this.getTranslation(phrase);
    }
  }

  getTranslation(phrase) {
    console.log(this.language);
    if (this.language == 'Русский') {
      return this.dictionary[phrase];
    } else {
      return phrase;
    }

  }
}
