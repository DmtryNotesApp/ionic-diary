import {Injectable} from '@angular/core';
import {Case} from "../models/case";
import {Events, NavController} from "@ionic/angular";
import { Storage } from '@ionic/storage';


@Injectable({
  providedIn: 'root'
})
export class CommonService {

  firstDayOfWeek: Date;
  firstDaysOfWeeks: Date[] = [];
  caseParams;
  cases = [];
  casesMap = {};
  cameFromFirstDayOfWeek: Date;
  actualDate: Date = new Date();

  lastCaseId: number = 0;

  isInitialized: boolean = false;

  constructor(
    private eventEmitter: Events,
    private navCtrl: NavController,
    private storage: Storage
  ) {
    this.getLastCaseId();
    this.setUpData();
  }

  getLastCaseId() {
    this.getDataAcync('lastCaseId')
    .then(data => {
      this.lastCaseId = (data && data[0]) ? +data[0] : 0;
    })
  }

  saveData(key: string, value) {
    this.storage.set(key, value);
  }

  async getDataAcync(key) {
    return await this.storage.get(key);
  }

  setUpData() {
    this.firstDayOfWeek = this.getMonday(this.actualDate);
    if (this.firstDayOfWeek) {
      this.setFirstDaysArray();
    }
  }

  setFirstDaysArray() {
    this.firstDaysOfWeeks = [];
    for (let i = -4; i < 5; i++) {
      this.firstDaysOfWeeks.push(this.addDays(7 * i));
    }
  }

  addDays(num) {
    let date = new Date(
      this.firstDayOfWeek.getFullYear(),
      this.firstDayOfWeek.getMonth(),
      this.firstDayOfWeek.getDate(),
      this.firstDayOfWeek.getDay()
    );
    return new Date(date.setDate(date.getDate() + num));
  }

  getMonday( date ) {
      var day = date.getDay() || 7;
      if( day !== 1 )
          date.setHours(-24 * (day - 1));
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getDay());
  }

  getFirstDayOfWeek(): Date {
    return this.firstDayOfWeek;
  }

  getFirstDaysOfWeeks(): Date[] {
    return this.firstDaysOfWeeks;
  }

  getDate(weekFirstDay, n): Date {
    // let todayMillis = Date.now() + n * 1000 * 3600 * 24;
    let currentWeekFirstDay = weekFirstDay || this.firstDayOfWeek;
    this.setNoneHour(currentWeekFirstDay);
    let curDate = currentWeekFirstDay.setDate(currentWeekFirstDay.getDate());
    let date: Date = new Date(curDate + n * 24 * 3600 * 1000);
    return date;
  }

  setNoneHour(date) {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
  }

  getPickedDate(caseDateS) {
    let pickedDate = new Date(Date.parse(caseDateS.toString()));

    pickedDate.setHours(0);
    pickedDate.setMinutes(0);
    pickedDate.setSeconds(0);
    pickedDate.setMilliseconds(0);

    return pickedDate;
  }

  getOutputDate(date: Date): string {
    let options = {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
    };

    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getDay()).toLocaleDateString('en', options);
  }

  setCaseParams(caseParams) {
    this.caseParams = caseParams;
  }

  getCaseParams() {
    return this.caseParams;
  }

  setCases(cases) {
    this.cases = cases;
  }

  setCasesMap(casesMap) {
    this.casesMap = casesMap;
  }

  getCasesMap() {
    return this.casesMap;
  }

  redirectToCasePage(isCreationMode, caseEvent) {
    let caseParams = {
      firstDayOfWeek: caseEvent.firstDayOfWeek || this.getMonday(new Date(caseEvent.caseDate)),
      isCreationMode: isCreationMode,
      caseDate: caseEvent.date || new Date(caseEvent.caseDate),
      previousCaseDate: caseEvent.previousCaseDate || new Date(caseEvent.caseDate),
      case: caseEvent,
      description: caseEvent.description || '',
      isFinished: caseEvent.isFinished || false,
      comeFromCasesManager: caseEvent.comeFromCasesManager
    };

    this.setCaseParams(caseParams);

    this.navCtrl.navigateForward('case', {
      animated: true,
      animationDirection: 'forward'
    });
  }

  processCase(caseEvent) {
    let caseId;

    let date = new Date(caseEvent.caseDate);
    this.setNoneHour(date);
    let prevDate;
    let datesArray = [date.toDateString()];

    let casesArray = this.casesMap[date + ''] || [];

    if (caseEvent.previousCaseDate && !caseEvent.isCreationMode) {
      prevDate = new Date(caseEvent.previousCaseDate);
      this.setNoneHour(prevDate);
      datesArray.push(prevDate.toDateString());

      casesArray = this.casesMap[prevDate + ''] || [];
    }

    if (caseEvent.isCreationMode) {
      caseId = this.lastCaseId + 1;
      this.lastCaseId += 1;
      this.saveData('lastCaseId', caseId);
      let processedCase = new Case(caseId, caseEvent.caseDate, caseEvent.isFinished, caseEvent.description);
      this.cases.push(processedCase);

      casesArray.push(processedCase);
      this.casesMap[date + ''] = casesArray;
    } else {
      caseId = caseEvent.id;
      let caseToUpdate = this.cases.find(cs => cs.id == caseId);
      let index = this.cases.indexOf(caseToUpdate);
      caseToUpdate = new Case(caseId, caseEvent.caseDate, caseEvent.isFinished, caseEvent.description);
      this.cases[index] = caseToUpdate;

      if (caseEvent.previousCaseDate) {
        casesArray = casesArray.filter(cs => cs.id !== caseEvent.id);
        let targetArray = this.casesMap[date + ''] || [];
        if (targetArray.length > 0) {
          targetArray = targetArray.filter(cs => cs.id !== caseEvent.id);
        }

        targetArray.push(caseToUpdate);

        this.casesMap[prevDate + ''] = casesArray;
        this.casesMap[date + ''] = targetArray;
      } else {
        let caseToUpdateInMap = casesArray.find(ev => ev.id == caseId);
        let indexInMap = casesArray.indexOf(caseToUpdateInMap);
        casesArray[indexInMap] = caseToUpdate;

        this.casesMap[date + ''] = casesArray;
      }

    }
    this.updateDayCardComponent(datesArray);
    if (caseEvent.comeFromCasesManager) {
      this.updateCasesManagerPage();
    }
    this.saveCases(this.cases);
  }

  updateCasesManagerPage() {
    this.eventEmitter.publish('updateCasesManagerPage');
  }

  updateDayCardComponent(dateArray) {
    this.eventEmitter.publish('updateDayCardComponent', dateArray);
  }

  deleteCase(caseEvent) {
    let date = new Date(caseEvent.caseDate);
    this.setNoneHour(date);
    this.casesMap[date + ''] = this.casesMap[date + ''].filter(cs => cs.id !== caseEvent.id);
    this.cases = this.cases.filter(cs => cs.id !== caseEvent.id);
    this.saveCases(this.cases);
    this.updateDayCardComponent([date.toDateString()]);
  }

  deleteArrayOfCases(casesIds) {
    let arrayOfCases = this.cases.filter(cs => casesIds.indexOf(cs.id) != -1);
    if (arrayOfCases && arrayOfCases.length > 0) {
      for(let i = 0; i < arrayOfCases.length; i++) {
        this.deleteCase(arrayOfCases[i]);
      }
    }
  }

  saveCases(cases) {
    this.saveData('plannedCases', JSON.stringify(cases));
  }

  saveStandingTasks(tasks) {
    this.saveData('standingTasks', JSON.stringify(tasks));
  }

  customAlertOptions: any = {
    header: 'Pizza Toppings',
    subHeader: 'Select your toppings',
    message: '$1.00 per topping',
    translucent: true
  };

  customPopoverOptions: any = {
    header: 'Hair Color',
    subHeader: 'Select your hair color',
    message: 'Only select your dominant hair color'
  };

  customActionSheetOptions: any = {
    header: 'Colors',
    subHeader: 'Select your favorite color'
  };

}
