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
