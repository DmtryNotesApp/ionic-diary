import {Component, Input, OnInit} from '@angular/core';
import {AlertController, PopoverController} from "@ionic/angular";
import {CommonService} from "../shared/common.service";

@Component({
  selector: 'app-popover-actions',
  templateUrl: './popover-actions.component.html',
  styleUrls: ['./popover-actions.component.scss'],
})
export class PopoverActionsComponent implements OnInit {

  @Input()
  calendarEvent;

  constructor(
    public popoverController: PopoverController,
    public alertController: AlertController,
    public commonService: CommonService
  ) { }

  ngOnInit() {}

  changeEvent() {
    this.calendarEvent.comeFromEventManager = true;
    this.commonService.redirectToEventPage(false, this.calendarEvent);
    this.popoverController.dismiss();
  }

  deleteEvent() {
    this.commonService.deleteEvent(this.calendarEvent);
    this.popoverController.dismiss();
  }

  async showAlert() {
    const alert = await this.alertController.create({
      header: 'Confirm Action',
      message: 'Are you sure you want to delete this event?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            console.log('Confirm Okay');
            this.deleteEvent();
          }
        }, {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
            this.popoverController.dismiss();
          }
        }
      ]
    });

    await alert.present();
  }
}
