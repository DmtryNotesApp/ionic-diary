import { Pipe, PipeTransform } from '@angular/core';
import {CommonService} from "./common.service";

@Pipe({
  name: 'eventsFilter'
})
export class EventsFilterPipe implements PipeTransform {

  constructor(public commonService: CommonService){}

  transform(events: any, args?: any): any {
    events = events || [];
    let date: Date = this.commonService.getDate(args.firstDayOfWeek, args.dayNumber);
    let dayMills: number = date.setDate(date.getDate());
    return events.filter(event => {
      let eventDate = event.eventDate;
      let eventDateMills = new Date(eventDate).getTime();
      return eventDateMills == dayMills;
    });
  }

}
