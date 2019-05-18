import { Component, OnInit } from '@angular/core';
import {CommonService} from "../shared/common.service";
import {AlertController, Events, NavController, PopoverController} from "@ionic/angular";
import {PopoverActionsComponent} from "../popover-actions/popover-actions.component";

@Component({
  selector: 'app-cases-manager',
  templateUrl: './cases-manager.page.html',
  styleUrls: ['./cases-manager.page.scss'],
})
export class CasesManagerPage implements OnInit {

  casesMap: Object = {};
  casesMapKeys: string[] = [];
  switchedDays: Object = {};
  markedCases: Object = {};
  allCasesMarked: boolean = false;
  numberOfCases: number = 0;
  showAllDays: boolean = true;

  constructor(
    private commonService: CommonService,
    private alertController: AlertController,
    private eventEmitter: Events,
    private popoverController: PopoverController,
    private navCtrl: NavController
  ) {
    let self = this;
    this.eventEmitter.subscribe('updateCasesManagerPage', function eventHandler() {
      self.setupData();
    })
  }

  ngOnInit() {
    this.setupData();

    for (let i = 0; i < this.casesMapKeys.length; i++) {
      this.switchedDays[i] = true;
    }
  }

  ngOnDestroy() {
    this.eventEmitter.unsubscribe('updateCasesManagerPage');
  }

  setupData() {
    this.numberOfCases = 0;

    this.casesMap = this.commonService.getCasesMap();
    this.casesMapKeys = Object.keys(this.casesMap)
      .filter(dateString => dateString != 'Invalid Date')
      .sort(function(date1, date2) {
        let date1Mls = new Date(date1).getTime();
        let date2Mls = new Date(date2).getTime();
        if (date1Mls > date2Mls) {
          return -1;
        } else if (date1Mls < date2Mls) {
          return 1
        } else {
          return 0;
        }
      });

    let casesArray = Object.values(this.casesMap);
    for(let array of casesArray) {
      for (let caseEvent of array) {
        this.markedCases[caseEvent.id] = false;
        this.numberOfCases += 1;
      }
    }

  }

  switchDay(index) {
    if (this.switchedDays[index] == undefined) {
      this.switchedDays[index] = true;
    } else {
      this.switchedDays[index] = !this.switchedDays[index];
    }
  }

  markAllCases() {
    let casesIds = Object.keys(this.markedCases);
    for(let i of casesIds) {
      this.markedCases[i] = this.allCasesMarked;
    }
  }

  deleteSelectedCases() {
    let keys = Object.keys(this.markedCases);
    let arrayToDelete = [];
    for (let key of keys) {
      if(this.markedCases[key]) {
        arrayToDelete.push(Number(key));
      }
    }
    if (arrayToDelete.length > 0) {
      this.showAlert(arrayToDelete);
    }
  }

  async showAlert(arrayToDelete) {
    const alert = await this.alertController.create({
      header: 'Confirm Action',
      message: (arrayToDelete.length > 1) ?
      'Are you sure you want to delete ' + arrayToDelete.length + ' cases?' :
      'Are you sure you want to delete the selected case?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.deleteForward(arrayToDelete);
          }
        }, {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.popoverController.dismiss();
          }
        }
      ]
    });

    await alert.present();
  }

  deleteForward(arrayToDelete) {
    this.commonService.deleteArrayOfCases(arrayToDelete);
    this.numberOfCases = this.numberOfCases - arrayToDelete.length;
    for (let i = 0; i < arrayToDelete.length; i++) {
      this.markedCases[arrayToDelete[i]] = false;
    }
  }

  createNewCase() {
    this.commonService.redirectToCasePage(true, {
      caseDate: new Date().toDateString(),
      comeFromCasesManager: true
    });
  }

  async showMenu(event, calendarCase) {
    const popover = await this.popoverController.create({
      component: PopoverActionsComponent,
      animated: true,
      backdropDismiss: true,
      componentProps: {calendarCase: calendarCase},
      event: event,
      translucent: true
    });
    return await popover.present();
  }

  goBack() {
    let url = 'home';
    this.navCtrl.navigateBack(url, {
      animated: true,
      animationDirection: 'back'
    });
  }
}
