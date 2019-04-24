import {Injectable} from '@angular/core';
import {DiaryEvent} from "../models/diary-event";

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  firstDayOfWeek: Date;
  eventParams;
  events;

  constructor() {
    this.firstDayOfWeek = this.getMonday(new Date());
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

    getDate(n): Date {
      // let todayMillis = Date.now() + n * 1000 * 3600 * 24;
      let curDate = this.firstDayOfWeek.setDate(this.firstDayOfWeek.getDate());
      let date: Date = new Date(curDate + n * 24 * 3600 * 1000);
      return date;
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

  processEvent(event) {
    console.log('------- processEvent -------');
    console.log('event', event);
    let eventId;
    if (event.isCreationMode) {
      let lastEventId = +localStorage.getItem('lastEventId') || 0;
      eventId = lastEventId + 1;
      localStorage.setItem('lastEventId', eventId);
      let processedEvent = new DiaryEvent(eventId, event.creationDate, event.isDone, event.description);
      this.events.push(processedEvent);
    } else {
      eventId = event.id;
      let eventToUpdate = this.events.find(ev => ev.id == eventId);
      let index = this.events.indexOf(eventToUpdate);
      eventToUpdate = new DiaryEvent(eventId, event.creationDate, event.isDone, event.description);
      console.log('eventToUpdate', eventToUpdate);
      this.events[index] = eventToUpdate;
    }
    console.log('this.events', this.events);
    this.saveEvents(this.events);
  }

  deleteEvent(event) {
    console.log('------ common service + deleteEvent ------');
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
