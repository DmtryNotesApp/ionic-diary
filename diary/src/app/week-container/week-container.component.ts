import {Component, Input, OnInit} from '@angular/core';
import {DiaryEvent} from "../models/diary-event";

import {Events, ModalController} from '@ionic/angular';

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

  constructor(

  ) {}

  ngOnInit() {}

}
