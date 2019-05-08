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
  calendarCase;

  constructor(
    public popoverController: PopoverController,
    public alertController: AlertController,
    public commonService: CommonService
  ) { }

  ngOnInit() {}

  changeCase() {
    this.calendarCase.comeFromCasesManager = true;
    this.commonService.redirectToCasePage(false, this.calendarCase);
    this.popoverController.dismiss();
  }

  deleteCase() {
    this.commonService.deleteCase(this.calendarCase);
    this.commonService.updateCasesManagerPage();
    this.popoverController.dismiss();
  }

  async showAlert() {
    const alert = await this.alertController.create({
      header: 'Confirm Action',
      message: 'Are you sure you want to delete this case?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.deleteCase();
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
}
