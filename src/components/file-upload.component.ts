import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExcelImportService } from '../services/excel-import.service';
import { EmployeeService } from '../services/employee.service';
import { GoogleApiService } from '../services/googleapi.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="upload-container">
      <div class="upload-area" (click)="fileInput.click()"
           [class.dragging]="isDragging"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)">
        <input
          #fileInput
          type="file"
          accept=".xlsx,.xls"
          (change)="onFileSelected($event)"
          style="display: none"
        />
        <!-- <div class="upload-icon">📊</div> -->
        <h3>Import Employee Data</h3>
        <p>Click to browse or drag and drop Excel file</p>
        <p class="file-info">.xlsx, .xls files accepted</p>
      </div>

      @if (isLoading) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Processing file...</p>
        </div>
      }

      @if (error) {
        <div class="error-message">
          <span>⚠️</span> {{ error }}
        </div>
      }

      @if (successMessage) {
        <div class="success-message">
          <span>✓</span> {{ successMessage }}
        </div>
      }
    </div>
  `,
  styles: [`
    .upload-container {
      padding: 20px;
    }

    .upload-area {
      border: 2px dashed #5a7ea6;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: rgba(90, 126, 166, 0.05);
    }

    .upload-area:hover, .upload-area.dragging {
      border-color: #a2cd96;
      background: rgba(162, 205, 150, 0.1);
      transform: scale(1.02);
    }

    .upload-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }

    .upload-area h3 {
      color: #a2cd96;
      margin-bottom: 10px;
      font-size: 20px;
    }

    .upload-area p {
      color: #5a7ea6;
      margin: 5px 0;
    }

    .file-info {
      font-size: 12px;
      color: #666;
    }

    .loading {
      text-align: center;
      padding: 20px;
      color: #a2cd96;
    }

    .spinner {
      border: 3px solid rgba(90, 126, 166, 0.3);
      border-top: 3px solid #a2cd96;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 10px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message, .success-message {
      margin-top: 15px;
      padding: 15px;
      border-radius: 6px;
      text-align: center;
      font-weight: 500;
    }

    .error-message {
      background: rgba(220, 38, 38, 0.1);
      color: #ef4444;
      border: 1px solid rgba(220, 38, 38, 0.3);
    }

    .success-message {
      background: rgba(162, 205, 150, 0.1);
      color: #a2cd96;
      border: 1px solid rgba(162, 205, 150, 0.3);
    }
  `]
})
export class FileUploadComponent {
  @Output() fileProcessed = new EventEmitter<void>();

  ngOnInit(): void {
    // this.googleService.initClient().then(() => {
    //   console.log("Gmail API Initialized");
    // });
    // this.initializeGmail()
  }
  async initializeGmail() {
    await this.googleService.initClient();       // load Gmail API
    await this.googleService.signIn();           // login & get token
  }

  isLoading = false;
  error = '';
  successMessage = '';
  isDragging = false;

  constructor(
    private excelImportService: ExcelImportService,
    private employeeService: EmployeeService,
    private googleService: GoogleApiService
  ) { }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  async processFile(file: File) {
    this.error = '';
    this.successMessage = '';
    this.isLoading = true;

    try {
      const data = await this.excelImportService.parseExcelFile(file);
      const employees = this.employeeService.parseExcelData(data);
      localStorage.removeItem('employees');
      this.employeeService.setEmployees(employees);
      this.successMessage = `Successfully imported ${employees.length} employees`;
      this.fileProcessed.emit();
      // this.sendEmailTest()

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (err) {
      this.error = 'Failed to process file. Please ensure it is a valid Excel file.';
    } finally {
      this.isLoading = false;
    }
  }
  // async sendEmailTest() {
  //   await this.googleService.sendEmail(
  //     'hassanasghar2207@gmail.com',           // receiver
  //     'Test Email',                           // subject
  //     'Hello, this is a test email from Angular!' // body
  //   ).then((response: any) => {
  //     console.log('Email sent', response);
  //   }).catch((err: any) => {
  //     console.error('Failed to send email', err);
  //   });
  // }

}
