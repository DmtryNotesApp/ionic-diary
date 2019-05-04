import {Injectable} from '@angular/core';
import {DiaryEvent} from "../models/diary-event";
import {Events} from "@ionic/angular";

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

  iterations: number = 0;

  constructor(
    public eventEmitter: Events
  ) {
    this.firstDayOfWeek = this.getMonday(new Date());
    console.log('this.firstDayOfWeek', this.firstDayOfWeek);
    if (this.firstDayOfWeek) {
      this.setFirstDaysArray();
    }
  }

  addIteration() {
    this.iterations += 1;
    console.log('this.iterations', this.iterations);
  }
    setFirstDaysArray() {
      console.log('------ setFirstDaysArray ------');
      for (let i = -4; i < 5; i++) {
        this.firstDaysOfWeeks.push(this.addDays(7 * i));
      }
      console.log('this.firstDaysOfWeeks', this.firstDaysOfWeeks);
    }

  addDays(num) {
    console.log('num', num);
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
    console.log('pickedDate', pickedDate);

    pickedDate.setHours(0);
    pickedDate.setMinutes(0);
    pickedDate.setSeconds(0);
    pickedDate.setMilliseconds(0);
    console.log('pickedDate', pickedDate);

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
    console.log('this.events', this.events);
    this.events = events;
  }

  setEventsMap(eventsMap) {
    this.eventsMap = eventsMap;
  }

  processEvent(event) {
    console.log('------- processEvent -------');
    console.log('event', event);
    let eventId;

    let date = new Date(event.eventDate);
    this.setNoneHour(date);
    let prevDate;
    let datesArray = [date.toDateString()];

    console.log('date', date);
    let eventsArray = this.eventsMap[date + ''] || [];
    console.log('eventsArray', eventsArray);

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
      console.log('else');
      eventId = event.id;
      let eventToUpdate = this.events.find(ev => ev.id == eventId);
      console.log('eventToUpdate 1', eventToUpdate);
      let index = this.events.indexOf(eventToUpdate);
      eventToUpdate = new DiaryEvent(eventId, event.eventDate, event.isDone, event.description);
      console.log('eventToUpdate 2', eventToUpdate);
      this.events[index] = eventToUpdate;

      if (event.previousEventDate) {
        eventsArray = eventsArray.filter(ev => ev.id !== event.id);

        let targetArray = this.eventsMap[date + ''] || [];
        targetArray.push(eventToUpdate);

        this.eventsMap[prevDate + ''] = eventsArray;
        this.eventsMap[date + ''] = targetArray;
      } else {
        let eventToUpdateInMap = eventsArray.find(ev => ev.id == eventId);
        console.log('eventToUpdateInMap', eventToUpdateInMap);
        let indexInMap = eventsArray.indexOf(eventToUpdateInMap);
        console.log('indexInMap', indexInMap);
        eventsArray[indexInMap] = eventToUpdate;

        console.log('eventsArray', eventsArray);
        this.eventsMap[date + ''] = eventsArray;
      }

    }
    console.log('this.eventsMap', this.eventsMap);
    console.log('this.events', this.events);
    this.updateDayCardComponent(datesArray);
    this.saveEvents(this.events);
  }

  updateDayCardComponent(dateArray) {
    console.log('------ updateDayCardComponent from Event ------');
    console.log(dateArray);
    this.eventEmitter.publish('updateDayCardComponent', dateArray);
  }

  deleteEvent(event) {
    console.log('------ common service + deleteEvent ------');
    console.log('event', event);
    let date = new Date(event.eventDate);
    this.setNoneHour(date);
    this.eventsMap[date + ''] = this.eventsMap[date + ''].filter(ev => ev.id !== event.id);
    this.events = this.events.filter(ev => ev.id !== event.id);
    this.saveEvents(this.events);
  }

  saveEvents(events) {
    console.log('------ saveEvents ------');
    console.log('events', events);
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
