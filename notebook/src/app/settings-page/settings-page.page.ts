import { Component, OnInit } from '@angular/core';
import {NavController} from "@ionic/angular";
import {AppSettings} from "../models/app-settings";
import {CommonService} from "../shared/common.service";

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.page.html',
  styleUrls: ['./settings-page.page.scss'],
})
export class SettingsPagePage implements OnInit {

  notificationsEnabled: boolean = false;
  soundsEnabled: boolean = false;
  language: string = 'English';

  oldSettings: AppSettings = {};

  constructor(
    private navCtrl: NavController,
    private commonSerice: CommonService
  ) { }

  ngOnInit() {
    if (
      this.commonSerice &&
      this.commonSerice.appSettings
    ) {
      this.notificationsEnabled = this.commonSerice.appSettings.notificationsEnabled;
      this.soundsEnabled = this.commonSerice.appSettings.soundsEnabled;
      this.language = this.commonSerice.appSettings.chosenLanguage;

      this.oldSettings = Object.assign({}, this.commonSerice.appSettings);
    }
  }

  saveSettings() {
    console.log('------ saveSettings ------');
    let appSettings = new AppSettings(
      this.notificationsEnabled,
      this.soundsEnabled,
      this.language
    );
    this.commonSerice.appSettings = appSettings;
    this.commonSerice.saveSettings(appSettings);
    console.log('appSettings', appSettings);

    if (this.notificationsEnabled != this.oldSettings.notificationsEnabled) {
      if (this.notificationsEnabled) {
        console.log('schedule notifications');
        this.commonSerice.scheduleAllNotifications();
      } else {
        console.log('cancel notifications');
        this.commonSerice.deleteAllNotifications();
      }
    } else if (this.soundsEnabled != this.oldSettings.soundsEnabled) {
      console.log('update sounds for notifications');
    }

    this.oldSettings = appSettings;
    this.goBack();
  }

  goBack() {
    let url = 'home';
    this.navCtrl.navigateBack(url, {
      animated: true,
      animationDirection: 'back'
    });
  }
}
