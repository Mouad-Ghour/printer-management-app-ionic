import { Injectable } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { environment } from '../../environments/environment';

declare var google: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private accessToken: string | null = null;
  private tokenClient: any;


  constructor(private platform: Platform, private toastController: ToastController) {
    if (!this.platform.is('capacitor')) {
      this.initializeGoogleIdentityServices();
    }
  }

  private initializeGoogleIdentityServices(): void {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: environment.googleWebClientId,
        scope: 'https://www.googleapis.com/auth/calendar.events',
        callback: (response: any) => this.handleTokenResponse(response),
      });
    };
    document.head.appendChild(script);
  }

  private handleTokenResponse(response: any): void {
    if (response.error) {
      console.error('Google Sign-In Error:', response);
      this.showToast('Google Sign-In failed.');
      return;
    }
    this.accessToken = response.access_token;
    console.log('Access Token:', this.accessToken);
  }

  async signIn(): Promise<string | null> {
    if (this.platform.is('capacitor')) {
      // Native platforms
      try {
        const user = await GoogleAuth.signIn();
        this.accessToken = user.authentication.accessToken;
        return this.accessToken;
      } catch (error) {
        console.error('Google Sign-In Error:', error);
        await this.showToast('Google Sign-In failed.');
        return null;
      }
    } else {
      // Web platform
      return new Promise((resolve) => {
        if (!this.tokenClient) {
          this.showToast('Google Identity Services not initialized.');
          resolve(null);
        } else {
          this.tokenClient.callback = (response: any) => {
            if (response.error) {
              console.error('Google Sign-In Error:', response);
              this.showToast('Google Sign-In failed.');
              resolve(null);
            } else {
              this.accessToken = response.access_token;
              resolve(this.accessToken);
            }
          };
          this.tokenClient.requestAccessToken();
        }
      });
    }
  }

  async signOut(): Promise<void> {
    if (this.platform.is('capacitor')) {
      try {
        await GoogleAuth.signOut();
        this.accessToken = null;
      } catch (error) {
        console.error('Google Sign-Out Error:', error);
      }
    } else {
      // Web platform
      if (this.accessToken) {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${this.accessToken}`, {
          method: 'POST',
          headers: {
            'Content-type': 'application/x-www-form-urlencoded',
          },
        });
        this.accessToken = null;
        await this.showToast('Signed out successfully.');
      }
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async showToast(message: string, color: string = 'danger'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}
