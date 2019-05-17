import { Pipe, PipeTransform } from '@angular/core';
import {CommonService} from "./common.service";

@Pipe({
  name: 'casesFilter'
})
export class CasesFilterPipe implements PipeTransform {

  constructor(private commonService: CommonService){}

  transform(cases: any, args?: any): any {
    cases = cases || [];
    let date: Date = this.commonService.getDate(args.firstDayOfWeek, args.dayNumber);
    let dayMills: number = date.setDate(date.getDate());
    return cases.filter(caseEvent => {
      let caseDate = caseEvent.caseDate;
      let caseDateMills = new Date(caseDate).getTime();
      return caseDateMills == dayMills;
    });
  }

}
