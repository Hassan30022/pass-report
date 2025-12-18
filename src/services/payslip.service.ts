import { Injectable } from '@angular/core';
import { Employee } from '../models/employee.model';
import jsPDF from 'jspdf';
import html2canvas from "html2canvas";
import { GoogleApiService } from './googleapi.service';
import { EmployeeService } from './employee.service';

@Injectable({
    providedIn: 'root'
})
export class PayslipService {
    generatedDate = this.getTodayDate();
    is2ShadesSelected: boolean = false;
    constructor(private googleService: GoogleApiService, private employeeService: EmployeeService) { }

    getTodayDate(): string {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();

        return `${dd}-${mm}-${yyyy}`;
    }

    formatNumber(value: number): string {
        if (value == null) return '';
        return value.toLocaleString('en-US', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        });
    }

    // async sendPayslipPDF(employee: Employee, is2ShadesSelected: boolean) {
    //   await this.googleService.sendEmail(
    //     employee.email,           // receiver
    //     'Test Email',                           // subject
    //     'Hello, this is a test email from payroll by Hassan !' // body
    //   ).then((response: any) => {
    //     console.log('Email sent', response);
    //   }).catch((err: any) => {
    //     console.error('Failed to send email', err);
    //   });
    // }


    sendPayslipPDF(employee: Employee, is2ShadesSelected: boolean): Promise<void> {
        this.is2ShadesSelected = is2ShadesSelected;
        return new Promise((resolve: any) => {
            const html = is2ShadesSelected ? this.generatePayslip2ShadesHTML(employee) : this.generateReportCardHTML(employee)

            const container = document.createElement("div");
            container.innerHTML = html;
            container.style.position = "fixed";
            container.style.left = "-999px";
            container.style.top = "-999px";
            container.style.width = "800px";
            container.style.background = "#000";
            document.body.appendChild(container);

            html2canvas(container, {
                scale: 2,
                backgroundColor: null
            }).then((canvas) => {
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF("p", "mm", "a4");
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = 210;
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

                //   const pdfBase64 = pdf.output("datauristring").replace("data:application/pdf;base64,", "");
                const pdfArrayBuffer = pdf.output("arraybuffer");
                const uint8 = new Uint8Array(pdfArrayBuffer);
                let raw = "";
                uint8.forEach(b => raw += String.fromCharCode(b));
                const pdfBase64 = btoa(raw);
                console.log("GAPI LOADED?", gapi?.client?.gmail);
                this.googleService.sendEmailWithAttachment(
                    employee.email,
                    "Monthly Payslip",
                    `Your monthly payslip is attached.\n\nRegards,\n ${is2ShadesSelected ? '2 Shades BPO' : 'The Synergates Business Solutions (PVT) Ltd.' }`,
                    pdfBase64
                ).then((res: any) => {
                    console.log("Email sent with PDF!", res);
                    employee.sendingEmail = false;
                    employee.sentEmail = true;
                    this.employeeService.updateEmployee(employee);
                }).catch((err: any) => {
                    console.error("Email sending failed", err);
                    employee.sendingEmail = false;
                    employee.sentEmail = false;
                    this.employeeService.updateEmployee(employee);
                });
                container.remove();
                resolve(pdfBase64);
            });
        });
    }

    generatePayslipPDF(employee: Employee, is2ShadesSelected: boolean): Promise<void> {
        this.is2ShadesSelected = is2ShadesSelected;
        return new Promise((resolve) => {
            const html = is2ShadesSelected ? this.generatePayslip2ShadesHTML(employee) : this.generateReportCardHTML(employee)

            const container = document.createElement("div");
            container.innerHTML = html;
            container.style.position = "fixed";
            container.style.left = "-999px";
            container.style.top = "-999px";
            container.style.width = "800px";
            container.style.background = "#000";
            document.body.appendChild(container);

            html2canvas(container, {
                scale: 2,
                backgroundColor: null
            }).then((canvas) => {
                const imgData = canvas.toDataURL("image/png");

                const pdf = new jsPDF("p", "mm", "a4");
                const imgProps = pdf.getImageProperties(imgData);

                const pdfWidth = 210;
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

                pdf.save(`${employee.studentName}_reportCard.pdf`);
                employee.downloaded = true;
                this.employeeService.updateEmployee(employee);
                container.remove();
                resolve(); // 🟢 PDF fully saved — tell component to stop loader
            });
        });
    }


    generateReportCardHTML(employee: Employee): string {

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>PAK Aspire School System – Report Card</title>

  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: "Segoe UI", Tahoma, Arial, sans-serif;
      background: #f4f6f9;
      color: #222;
    }

    .page {
      max-width: 1100px;
      margin: auto;
      background: #fff;
      padding: 20px 24px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    }

    .students {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .report-card {
      border: 1px solid #dcdcdc;
      border-radius: 6px;
      padding: 14px;
    }

    .school-header {
      text-align: center;
      border-bottom: 1px solid #2f5fa7;
      padding-bottom: 6px;
      margin-bottom: 10px;
    }

    .school-header h1 {
      font-size: 16px;
      margin: 0;
      color: #2f5fa7;
    }

    .school-header p {
      font-size: 11px;
      margin: 2px 0 0;
    }

    .report-title {
      text-align: center;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .student-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      font-size: 12px;
      gap: 6px 10px;
      margin-bottom: 10px;
    }

    .student-info span {
      font-weight: 600;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    th, td {
      border: 1px solid #cfcfcf;
      padding: 6px;
      text-align: center;
    }

    th {
      background: #2f5fa7;
      color: #fff;
    }

    tfoot td {
      font-weight: 600;
      background: #f1f3f6;
    }

    .remarks {
      font-size: 12px;
      margin-top: 6px;
    }

    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 18px;
      font-size: 12px;
    }

    .sign-box {
      width: 45%;
      text-align: center;
      border-top: 1px solid #444;
      padding-top: 4px;
    }
  </style>
</head>
<body>

<div class="page">
  <div class="students">

    <!-- STUDENT MOCK (ReportCard model based) -->
    <div class="report-card">
      <div class="school-header">
        <h1>PAK ASPIRE SCHOOL SYSTEM</h1>
        <p>Academic Report Card</p>
      </div>

      <div class="report-title">Student Report</div>

      <div class="student-info">
        <div><span>Name:</span> Ali Ahmed</div>
        <div><span>Class:</span> Grade 5</div>
        <div><span>Total Marks:</span> 700</div>
        <div><span>Obtained:</span> 608</div>
        <div><span>Percentage:</span> 86.85%</div>
        <div><span>Result:</span> Pass</div>
      </div>

      <table>
        <thead>
        <tr>
          <th>Subject</th>
          <th>Total</th>
          <th>Obtained</th>
          <th>Grade</th>
        </tr>
        </thead>

        <tbody>
        <!-- Islamiat -->
        <tr>
          <td>Islamiyat</td>
          <td>100</td> <!-- 50 oral + 50 written -->
          <td>92</td>  <!-- 46 oral + 46 written -->
          <td>A+</td>
        </tr>

        <!-- Urdu -->
        <tr>
          <td>Urdu</td>
          <td>100</td>
          <td>78</td>
          <td>B+</td>
        </tr>

        <!-- English -->
        <tr>
          <td>English</td>
          <td>100</td>
          <td>85</td>
          <td>A</td>
        </tr>

        <tr>
          <td>Mathematics</td>
          <td>100</td>
          <td>90</td>
          <td>A+</td>
        </tr>

        <tr>
          <td>Science</td>
          <td>100</td>
          <td>88</td>
          <td>A</td>
        </tr>

        <tr>
          <td>Computer</td>
          <td>100</td>
          <td>95</td>
          <td>A+</td>
        </tr>
        </tbody>

        <tfoot>
        <tr>
          <td>Total</td>
          <td>700</td>
          <td>608</td>
          <td>A</td>
        </tr>
        </tfoot>
      </table>

      <div class="remarks">
        <span>Remarks:</span> Excellent performance. Keep it up.
      </div>

      <div class="signatures">
        <div class="sign-box">Class Teacher</div>
        <div class="sign-box">Principal</div>
      </div>
    </div>

  </div>
</div>

</body>
</html>
`;

    }

    generatePayslip2ShadesHTML(employee: Employee): string {

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>PAK Aspire School System – Report Card</title>

  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: "Segoe UI", Tahoma, Arial, sans-serif;
      background: #f4f6f9;
      color: #222;
    }

    .page {
      max-width: 1100px;
      margin: auto;
      background: #fff;
      padding: 20px 24px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    }

    .students {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .report-card {
      border: 1px solid #dcdcdc;
      border-radius: 6px;
      padding: 14px;
    }

    .school-header {
      text-align: center;
      border-bottom: 1px solid #2f5fa7;
      padding-bottom: 6px;
      margin-bottom: 10px;
    }

    .school-header h1 {
      font-size: 16px;
      margin: 0;
      color: #2f5fa7;
    }

    .school-header p {
      font-size: 11px;
      margin: 2px 0 0;
    }

    .report-title {
      text-align: center;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .student-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      font-size: 12px;
      gap: 6px 10px;
      margin-bottom: 10px;
    }

    .student-info span {
      font-weight: 600;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    th, td {
      border: 1px solid #cfcfcf;
      padding: 6px;
      text-align: center;
    }

    th {
      background: #2f5fa7;
      color: #fff;
    }

    tfoot td {
      font-weight: 600;
      background: #f1f3f6;
    }

    .remarks {
      font-size: 12px;
      margin-top: 6px;
    }

    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 18px;
      font-size: 12px;
    }

    .sign-box {
      width: 45%;
      text-align: center;
      border-top: 1px solid #444;
      padding-top: 4px;
    }
  </style>
</head>
<body>

<div class="page">
  <div class="students">

    <!-- STUDENT MOCK (ReportCard model based) -->
    <div class="report-card">
      <div class="school-header">
        <h1>PAK ASPIRE SCHOOL SYSTEM</h1>
        <p>Academic Report Card</p>
      </div>

      <div class="report-title">Student Report</div>

      <div class="student-info">
        <div><span>Name:</span> Ali Ahmed</div>
        <div><span>Class:</span> Grade 5</div>
        <div><span>Total Marks:</span> 700</div>
        <div><span>Obtained:</span> 608</div>
        <div><span>Percentage:</span> 86.85%</div>
        <div><span>Result:</span> Pass</div>
      </div>

      <table>
        <thead>
        <tr>
          <th>Subject</th>
          <th>Total</th>
          <th>Obtained</th>
          <th>Grade</th>
        </tr>
        </thead>

        <tbody>
        <!-- Islamiat -->
        <tr>
          <td>Islamiyat</td>
          <td>100</td> <!-- 50 oral + 50 written -->
          <td>92</td>  <!-- 46 oral + 46 written -->
          <td>A+</td>
        </tr>

        <!-- Urdu -->
        <tr>
          <td>Urdu</td>
          <td>100</td>
          <td>78</td>
          <td>B+</td>
        </tr>

        <!-- English -->
        <tr>
          <td>English</td>
          <td>100</td>
          <td>85</td>
          <td>A</td>
        </tr>

        <tr>
          <td>Mathematics</td>
          <td>100</td>
          <td>90</td>
          <td>A+</td>
        </tr>

        <tr>
          <td>Science</td>
          <td>100</td>
          <td>88</td>
          <td>A</td>
        </tr>

        <tr>
          <td>Computer</td>
          <td>100</td>
          <td>95</td>
          <td>A+</td>
        </tr>
        </tbody>

        <tfoot>
        <tr>
          <td>Total</td>
          <td>700</td>
          <td>608</td>
          <td>A</td>
        </tr>
        </tfoot>
      </table>

      <div class="remarks">
        <span>Remarks:</span> Excellent performance. Keep it up.
      </div>

      <div class="signatures">
        <div class="sign-box">Class Teacher</div>
        <div class="sign-box">Principal</div>
      </div>
    </div>

  </div>
</div>

</body>
</html>
`;

    }
}