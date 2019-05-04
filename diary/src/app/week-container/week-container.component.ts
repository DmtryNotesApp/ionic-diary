import {Component, Input, OnInit} from '@angular/core';
import {DiaryEvent} from "../models/diary-event";

@Component({
  selector: 'app-week-container',
  templateUrl: './week-container.component.html',
  styleUrls: ['./week-container.component.scss'],
})
export class WeekContainerComponent implements OnInit {

  @Input()
  events: DiaryEvent[] = [];

  @Input()
  firstDayOfWeek: Date = new Date();

  mondayString: string;
  sundayString: string;

  constructor() { }

  ngOnInit() {
    this.mondayString = this.firstDayOfWeek.toDateString();
    let tempDateMls = this.firstDayOfWeek;
    let tempDate = new Date(
      this.firstDayOfWeek.getFullYear(),
      this.firstDayOfWeek.getMonth(),
      this.firstDayOfWeek.getDate()
    );
    tempDate.setDate(tempDate.getDate() + 6);
    this.sundayString = tempDate.toDateString();
  }

  showCalendar() {
    console.log('------ showCalendar ------');
  }

}
