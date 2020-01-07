import { Injectable } from '@angular/core';
import {CommonService} from "./common.service";
import {Events} from "@ionic/angular";

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  dictionary = {
    'No cases planned' : 'Нет записей',
    'Mark as Uncompleted': 'Возобновить',
    'Mark as Completed': 'Завершить',
    'View/Edit': 'Изменить',
    'Change Date': 'Перенести',
    'Delete': 'Удалить',
    'None active cases left ': 'Нет активных дел ',
    'Active cases left': 'Активных дел',
    'Are you sure you want to delete this case?': 'Удалить запись?',
    'Yes': 'Да',
    'No': 'Нет',
    'Menu': 'Меню',
    'Home': 'К записям',
    'Calendar': 'Календарь',
    'Manage Cases': 'Список дел',
    'Case Manager': 'Список дел',
    'My Notes': 'Мои заметки',
    'Settings': 'Настройки',
    'Cases': 'Записей',
    'Your Notes': 'Ваши заметки',
    'Change Records': 'Изменение записей',
    'Change': 'Изменить',
    'Done': 'Готово',
    'New Note': 'Сделать запись',
    'Make a Note': 'Сделать запись',
    'My Note...': 'Моя новая запись',
    'Cancel': 'Отменить',
    'Ok': 'Продолжить',
    'Are you sure you want to delete this Note?': 'Вы уверены, что хотите удалить эту запись?',
    'Language': 'Язык',
    'Notifications': 'Уведомления',
    'Save': 'Сохранить',
    'Set Time': 'Выбрать время',
    'Is Completed': 'Завершено',
    'Enter description': 'Введите описание',
    'Today': 'Сегодня',
    'Set': 'Выбрать',
    'Select a Date': 'Выберите дату',
    'January': 'Январь',
    'February': 'Февраль',
    'March': 'Март',
    'April': 'Апрель',
    'May': 'Май',
    'June': 'Июнь',
    'July': 'Июль',
    'August': 'Август',
    'September': 'Сентябрь',
    'October': 'Октябрь',
    'November': 'Ноябрь',
    'December': 'Декабрь',
    'Sun': 'Вос',
    'Mon': 'Пон',
    'Tue': 'Вт',
    'Wed': 'Ср',
    'Thu': 'Чет',
    'Fri': 'Пят',
    'Sat': 'Суб',
    'Jan': 'Янв',
    'Feb': 'Фев',
    'Mar': 'Мар',
    'Apr': 'Апр',
    'Jun': 'Июн',
    'Jul': 'Июл',
    'Aug': 'Авг',
    'Sep': 'Сен',
    'Oct': 'Окт',
    'Nov': 'Ноя',
    'Dec': 'Дек',
    'Are you sure you want to delete this record?': 'Вы уверены,что хотите удалить эту запись?',
    'Are you sure you want to delete these records (': 'Вы уверены, что хотите удалить выбранные записи (',
    'Confirm Action': 'Подтвердите действие',
    'Badges': 'Отображать бейдж',
    'New Notification': 'Новое уведомление',
    'last': 'last'
  };
  phrases = {};

  language = localStorage.getItem('language') || 'English';
  isEnglishLocale = this.language == 'English';

  constructor(private events: Events) {
    events.subscribe('change language', () => {
      this.initializeTranslationService();
      this.events.publish('updateHomePage', [new Date()]);
    });
    this.initializeTranslationService();
  }

  getTranslation(phrase) {
    if (!this.isEnglishLocale) {
      return this.dictionary[phrase] || phrase;
    } else {
      return phrase;
    }
  }

  initializeTranslationService() {
    this.language = localStorage.getItem('language') || 'English';
    this.isEnglishLocale = this.language == 'English';

    for(let phrase in this.dictionary) {
      this.phrases[phrase] = this.getTranslation(phrase);
    }
  }

  ngOnDestroy() {
    this.events.unsubscribe('change language');
  }
}
