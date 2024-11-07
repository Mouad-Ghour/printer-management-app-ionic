import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Plugins } from '@capacitor/core';

const { SplashScreen, StatusBar, GoogleAuth } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent {
  constructor(private platform: Platform) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();

    if (this.platform.is('capacitor')) {
      SplashScreen['hide']();
      StatusBar['hide']();
    }
    
    GoogleAuth['initialize']();
  }

  async signInWithGoogle() {
    try {
      const user = await GoogleAuth['signIn']();
      console.log('User Info:', user);
    } catch (error) {
      console.error('Sign-In Error:', error);
    }
  }
}
