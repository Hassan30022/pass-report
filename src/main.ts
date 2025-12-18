import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './components/file-upload.component';
import { EmployeeTableComponent } from './components/employee-table.component';
import { GoogleApiService } from './services/googleapi.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FileUploadComponent, EmployeeTableComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <h1 class="app-title">Payroll Management System</h1>
          <p class="app-subtitle">Employee Salary Management & Payslip Generation</p>
        </div>
        <button class="login-button" (click)="login()" [disabled]="isLoggedIn">{{isLoggedIn ? 'LoggedIn' : 'LogIn'}}</button>
      </header>

      <main class="app-main">
        <section class="upload-section">
          <app-file-upload (fileProcessed)="onFileProcessed()"></app-file-upload>
        </section>

        @if (showTable) {
          <section class="table-section">
            <app-employee-table></app-employee-table>
          </section>
        }
      </main>

      <footer class="app-footer">
        <p>&copy; 2025 Payroll Management System. All rights reserved.</p>
      </footer>
    </div>
  `,
  styles: [`

  
    :host {
      display: block;
      min-height: 100vh;
      background: #000;
    }

    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-header {
      background: linear-gradient(135deg, #5a7ea6 0%, #4a6e96 100%);
      color: #000;
      padding: 30px 20px;
      box-shadow: 0 4px 20px rgba(90, 126, 166, 0.3);
      border-bottom: 3px solid #a2cd96;
    }

    .login-button {
      position: absolute;
      top: 10px;
      right: 10px;
      background: linear-gradient(135deg, #a2cd96, #339184);
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.3s ease;
      white-space: nowrap;
      width: 100px;
      height: 40px;
    }

    .login-button:hover {
      background: linear-gradient(135deg, #8cbe7eff, #29796eff);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(90, 126, 166, 0.4);
    }

    .login-button:active {
      transform: translateY(0);
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .app-title {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }

    .app-subtitle {
      font-size: 16px;
      margin: 0;
      opacity: 0.9;
    }

    .app-main {
      flex: 1;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
      padding: 30px 20px;
    }

    .upload-section {
      margin-bottom: 30px;
    }

    .table-section {
      background: rgba(90, 126, 166, 0.05);
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #5a7ea6;
    }

    .app-footer {
      background: #1a1a1a;
      color: #666;
      text-align: center;
      padding: 20px;
      border-top: 1px solid #333;
      margin-top: auto;
    }

    .app-footer p {
      margin: 0;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .app-header {
        padding: 20px 15px;
      }

      .app-title {
        font-size: 24px;
      }

      .app-subtitle {
        font-size: 14px;
      }

      .app-main {
        padding: 20px 15px;
      }

      .table-section {
        padding: 15px;
      }
    }
  `]
})
export class App {

  isLoggedIn = false;
  showTable = false;

  constructor(private googleService: GoogleApiService) { }

  ngOnInit() {
    localStorage.getItem('employees') ? this.showTable = true : this.showTable = false;
  }

  onFileProcessed() {
    this.showTable = true;
  }

  async login() {
    await this.googleService.initClient().then(() => {
      console.log("Gmail API Initialized");
    });
    await this.googleService.signIn().then(() => {
      this.isLoggedIn = true;
      console.log("Login Status: ", this.isLoggedIn);
    }
    );
  }
}

bootstrapApplication(App);
