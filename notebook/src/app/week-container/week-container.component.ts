import {Component, Input, OnInit} from '@angular/core';
import {Case} from "../models/case";

@Component({
  selector: 'app-week-container',
  templateUrl: './week-container.component.html',
  styleUrls: ['./week-container.component.scss'],
})
export class WeekContainerComponent implements OnInit {

  @Input()
  cases: Case[] = [];

  @Input()
  firstDayOfWeek: Date = new Date();

  constructor(

  ) {}

  ngOnInit() {}
}
