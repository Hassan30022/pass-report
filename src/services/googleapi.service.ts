import { Injectable } from '@angular/core';

declare const gapi: any;
declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleApiService {

  private tokenClient: any;

  constructor() { }

  /** Load Gmail API client */
  initClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            apiKey: 'AIzaSyDcZEOcaqvnLrQGWoyybA_80dvWxCFbQZE',
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"]
          });
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  /** Initialize GIS token client */
  initGisClient() {
    if (!this.tokenClient) {
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: '765449572814-mt8uc9mnjha1s116072rllfvj2joa1vi.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/gmail.send',
        callback: (tokenResponse: any) => {
          console.log("Access token:", tokenResponse.access_token);
          gapi.client.setToken({ access_token: tokenResponse.access_token });
        },
      });
    }
  }

  /** Request login and wait for access token */
  signIn(): Promise<void> {
    return new Promise((resolve) => {
      this.initGisClient();

      // Override callback to resolve the promise when token is ready
      this.tokenClient.callback = (tokenResponse: any) => {
        console.log("Access token:", tokenResponse.access_token);
        gapi.client.setToken({ access_token: tokenResponse.access_token });
        resolve(); // ✅ Resolve only after token is ready
      };

      this.tokenClient.requestAccessToken();
    });
  }

  /** Send a simple email */
  sendEmail(to: string, subject: string, body: string) {
    const rawMessage = btoa(
      `To: ${to}
Subject: ${subject}
Content-Type: text/plain; charset=UTF-8

${body}`
    ).replace(/\+/g, '-').replace(/\//g, '_');

    return (gapi.client as any).gmail.users.messages.send({
      userId: 'me',
      resource: { raw: rawMessage }
    });
  }

  sendEmailWithAttachment(to: string, subject: string, body: string, pdfBase64: string) {
    const boundary = "boundary123";

    // Gmail RFC compliance
    const pdfChunk = pdfBase64.match(/.{1,76}/g)?.join("\r\n");

    const raw =
      `To: ${to}\r\n` +
      `Subject: ${subject}\r\n` +
      `MIME-Version: 1.0\r\n` +
      `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n` +

      `--${boundary}\r\n` +
      `Content-Type: text/plain; charset="UTF-8"\r\n\r\n` +
      `${body}\r\n\r\n` +

      `--${boundary}\r\n` +
      `Content-Type: application/pdf; name="payslip.pdf"\r\n` +
      `Content-Disposition: attachment; filename="payslip.pdf"\r\n` +
      `Content-Transfer-Encoding: base64\r\n\r\n` +
      `${pdfChunk}\r\n\r\n` +
      `--${boundary}--`;

    const encoded = btoa(raw)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    return gapi.client.gmail.users.messages.send({
      userId: "me",
      resource: { raw: encoded }
    });
  }
  isSignedIn(): boolean {
    // gapi or gapi.client not loaded yet
    if (typeof gapi === "undefined" || !gapi.client || !gapi.client.getToken) {
      return false;
    }

    const token = gapi.client.getToken();
    return !!token?.access_token;
  }

  // sendEmail(raw: string) {
  //   return gapi.client.gmail.users.messages.send({
  //     userId: 'me',
  //     resource: { raw }
  //   });
  // }
}
