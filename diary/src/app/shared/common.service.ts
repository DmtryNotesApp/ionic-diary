import {Injectable} from '@angular/core';
import {DiaryEvent} from "../models/diary-event";
import {Events, NavController} from "@ionic/angular";

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  firstDayOfWeek: Date;
  firstDaysOfWeeks: Date[] = [];
  eventParams;
  events;
  eventsMap = {};
  cameFromFirstDayOfWeek: Date;
  actualDate: Date = new Date();

  iterations: number = 0;

  constructor(
    public eventEmitter: Events,
    public navCtrl: NavController
  ) {
    this.setUpData();
  }

  setUpData() {
    console.log('------ setUpData -------');
    console.log('this.actualDate', this.actualDate);
    this.firstDayOfWeek = this.getMonday(this.actualDate);
    console.log('this.firstDayOfWeek', this.firstDayOfWeek);
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

  getPickedDate(eventDateS) {
    let pickedDate = new Date(Date.parse(eventDateS.toString()));

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

  setEventParams(eventParams) {
    this.eventParams = eventParams;
  }

  getEventParams() {
    return this.eventParams;
  }

  setEvents(events) {
    console.log('------ setEvents ------');
    this.events = events;
  }

  setEventsMap(eventsMap) {
    this.eventsMap = eventsMap;
  }

  getEventsMap() {
    return this.eventsMap;
  }

  redirectToEventPage(isCreationMode, event) {
    let eventParams = {
      firstDayOfWeek: event.firstDayOfWeek || this.getMonday(new Date(event.eventDate)),
      isCreationMode: isCreationMode,
      eventDate: event.date || new Date(event.eventDate),
      previousEventDate: event.previousEventDate || new Date(event.eventDate),
      event: event,
      description: event.description || '',
      isDone: event.isDone || false,
      comeFromEventManager: event.comeFromEventManager
    };

    console.log('eventParams', eventParams);
    this.setEventParams(eventParams);

    this.navCtrl.navigateForward('event', {
      animated: true,
      animationDirection: 'forward'
    });
  }

  processEvent(event) {
    console.log('------- processEvent -------');
    console.log('event', event);
    let eventId;

    let date = new Date(event.eventDate);
    this.setNoneHour(date);
    let prevDate;
    let datesArray = [date.toDateString()];

    let eventsArray = this.eventsMap[date + ''] || [];

    if (event.previousEventDate) {
      prevDate = new Date(event.previousEventDate);
      this.setNoneHour(prevDate);
      datesArray.push(prevDate.toDateString());

      eventsArray = this.eventsMap[prevDate + ''] || [];
    }

    if (event.isCreationMode) {
      let lastEventId = +localStorage.getItem('lastEventId') || 0;
      eventId = lastEventId + 1;
      localStorage.setItem('lastEventId', eventId);
      let processedEvent = new DiaryEvent(eventId, event.eventDate, event.isDone, event.description);
      this.events.push(processedEvent);

      eventsArray.push(processedEvent);
      this.eventsMap[date + ''] = eventsArray;
    } else {
      eventId = event.id;
      let eventToUpdate = this.events.find(ev => ev.id == eventId);
      let index = this.events.indexOf(eventToUpdate);
      eventToUpdate = new DiaryEvent(eventId, event.eventDate, event.isDone, event.description);
      this.events[index] = eventToUpdate;

      if (event.previousEventDate) {
        eventsArray = eventsArray.filter(ev => ev.id !== event.id);
        let targetArray = this.eventsMap[date + ''] || [];
        if (targetArray.length > 0) {
          targetArray = targetArray.filter(ev => ev.id !== event.id);
        }

        targetArray.push(eventToUpdate);
        console.log('eventsArray', eventsArray);
        console.log('targetArray', targetArray);

        this.eventsMap[prevDate + ''] = eventsArray;
        this.eventsMap[date + ''] = targetArray;
      } else {
        let eventToUpdateInMap = eventsArray.find(ev => ev.id == eventId);
        let indexInMap = eventsArray.indexOf(eventToUpdateInMap);
        eventsArray[indexInMap] = eventToUpdate;

        this.eventsMap[date + ''] = eventsArray;
      }

    }
    console.log('datesArray', datesArray);
    this.updateDayCardComponent(datesArray);
    if (event.comeFromEventManager) {
      this.updateEventsManagerPage();
    }
    this.saveEvents(this.events);
  }

  updateEventsManagerPage() {
    console.log('------ updateEventsManagerPage from Common Service ------');
    this.eventEmitter.publish('updateEventsManagerPage');
  }

  updateDayCardComponent(dateArray) {
    console.log('------ updateDayCardComponent from Common Service ------');
    this.eventEmitter.publish('updateDayCardComponent', dateArray);
  }

  deleteEvent(event) {
    console.log('------ common service + deleteEvent ------');
    let date = new Date(event.eventDate);
    this.setNoneHour(date);
    this.eventsMap[date + ''] = this.eventsMap[date + ''].filter(ev => ev.id !== event.id);
    this.events = this.events.filter(ev => ev.id !== event.id);
    this.saveEvents(this.events);
    this.updateDayCardComponent([date.toDateString()]);
  }

  deleteArrayOfEvents(eventsIds) {
    console.log('eventsIds', eventsIds);
    console.log('this.events', this.events);
    let arrayOfEvents = this.events.filter(ev => eventsIds.indexOf(ev.id) != -1);
    console.log('arrayOfEvents', arrayOfEvents);
    if (arrayOfEvents && arrayOfEvents.length > 0) {
      for(let i = 0; i < arrayOfEvents.length; i++) {
        this.deleteEvent(arrayOfEvents[i]);
      }
    }
  }

  saveEvents(events) {
    console.log('------ saveEvents ------');
    localStorage.setItem('plannedEvents', JSON.stringify(events));
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
