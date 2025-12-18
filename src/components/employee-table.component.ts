import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';
import { PayslipService } from '../services/payslip.service';
import { Employee } from '../models/employee.model';
import { GoogleApiService } from '../services/googleapi.service';

type SortField = keyof Employee;
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-employee-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="table-container">
      <button class="download-btn download-all clear-all-btn" (click)="clearData()" [disabled]="isDownloadingAll">
        Clear
      </button>
      <button class="download-btn download-all" (click)="downloadAll()" [disabled]="isDownloadingAll">
        {{ isDownloadingAll ? 'Downloading...' : 'Download All' }}
      </button>
        <!-- <div class="switch-button">
          <input class="switch-button-checkbox" type="checkbox" (change)="onToggle($event)">
          <label class="switch-button-label" for=""><span class="switch-button-label-span">Synergates</span></label>
        </div> -->

      <div class="controls">
        <div class="search-box">
          <!-- <span class="search-icon">🔍</span> -->
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (input)="applyFilters()"
            placeholder="Search employees by name or designation..."
            class="search-input"
          />
          @if (searchTerm) {
            <button class="clear-btn" (click)="clearSearch()">✕</button>
          }
        </div>
        <div class="results-count">
          Showing {{ filteredEmployees.length }} of {{ employees.length }} records
        </div>
      </div>

      @if (filteredEmployees.length === 0 && employees.length === 0) {
        <div class="no-data">
          <div class="no-data-icon">📋</div>
          <h3>No Report Card Data</h3>
          <p>Import an Excel file to view employee records</p>
        </div>
      } @else if (filteredEmployees.length === 0) {
        <div class="no-data">
          <div class="no-data-icon">🔍</div>
          <h3>No Results Found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="employee-table">
            <thead>
              <tr>
                <th (click)="sort('name')" class="sortable">
                  Name
                  <span class="sort-indicator">{{ getSortIndicator('name') }}</span>
                </th>
                <th (click)="sort('designation')" class="sortable">
                  Designation
                  <span class="sort-indicator">{{ getSortIndicator('designation') }}</span>
                </th>
                <th (click)="sort('basicSalary')" class="sortable">
                  Basic Salary
                  <span class="sort-indicator">{{ getSortIndicator('basicSalary') }}</span>
                </th>
                <th (click)="sort('totalGrossSalary')" class="sortable">
                  Gross Salary
                  <span class="sort-indicator">{{ getSortIndicator('totalGrossSalary') }}</span>
                </th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th style="display: flex; justify-content: space-between;">Net Salary <div (click)="toggleNetSalary()"><svg style="width: 19px; cursor: pointer;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g clip-path="url(#clip0_15_200)"> <rect width="24" height="24" fill="none"></rect> <circle cx="12" cy="13" r="2" stroke="#000000" stroke-linejoin="round"></circle> <path d="M12 7.5C7.69517 7.5 4.47617 11.0833 3.39473 12.4653C3.14595 12.7832 3.14595 13.2168 3.39473 13.5347C4.47617 14.9167 7.69517 18.5 12 18.5C16.3048 18.5 19.5238 14.9167 20.6053 13.5347C20.8541 13.2168 20.8541 12.7832 20.6053 12.4653C19.5238 11.0833 16.3048 7.5 12 7.5Z" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></path> </g> <defs> <clipPath id="clip0_15_200"> <rect width="24" height="24" fill="white"></rect> </clipPath> </defs> </g></svg></div></th>
                <th>Action</th>
                <th>{{showEmailColumn ? 'Email' : ''}}</th>
              </tr>
            </thead>
            <tbody>
              @for (employee of filteredEmployees; track employee.id) {
                <tr>
                  <td class="name-cell">{{ employee.name }}</td>
                  <td>{{ employee.designation }}</td>
                  <td class="amount">Rs. {{ employee.basicSalary.toLocaleString() }}</td>
                  <td class="amount">Rs. {{ employee.totalGrossSalary.toLocaleString() }}</td>
                  <td class="amount">Rs. {{ calculateAllowances(employee).toLocaleString() }}</td>
                  <td class="amount deduction">Rs. {{ calculateDeductions(employee).toLocaleString() }}</td>
                  <!-- <td class="amount net-salary">Rs. {{ calculateNetSalary(employee).toLocaleString() }}</td> -->
                  <td class="amount net-salary">Rs.   <ng-container *ngIf="showNetSalary; else hiddenSalary">
                            {{ calculateNetSalary(employee).toLocaleString() }}
                          </ng-container>
                          <ng-template #hiddenSalary>
                            XXXXXX
                          </ng-template></td>
                  <td>
                    <button class="download-btn" (click)="downloadPayslip(employee)" [ngStyle]="{'background': (employee.downloaded && !employee.downloading) ? '#25b09b' : ''}" [disabled]="isDownloadingAll || employee.downloading">
                        <span *ngIf="!employee.downloading">{{employee.downloaded ? 'Downloaded' : 'Download'}}</span>
                        <div *ngIf="employee.downloading" class="loader"></div>
                    </button>
                  </td>
                  <td>
                    <button *ngIf="employee.email" class="download-btn" [ngStyle]="{'background': employee.sentEmail ? '#25b09b' : ''}" (click)="sendPayslip(employee)" [disabled]="isSendingAll || employee.sendingEmail || !isSignedIn()">
                        <span *ngIf="!employee.sendingEmail">{{employee.sentEmail ? 'Sent' : 'Send'}}</span>
                        <div *ngIf="employee.sendingEmail" class="loader"></div>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`

  .clear-all-btn {
    right: 20px !important;
    border: 2px solid red !important;
    background: #855050 !important;
  }
  .download-all{
        position: absolute;
    right: 140px;
    width: max-content !important;
  }
.switch-button {
  box-sizing: border-box !important;
  background: rgba(255, 255, 255, 0.56) !important;
  border-radius: 30px !important;
  overflow: hidden !important;
  width: 240px !important;
  text-align: center !important;
  font-size: 18px !important;
  font-weight: 600 !important;
  letter-spacing: 1px !important;
  color: black !important;
  position: relative !important;
  padding-right: 120px !important;
  margin-bottom: 10px !important;

  &::before {
    content: "2 Shades" !important;
    position: absolute !important;
    top: 0 !important;
    bottom: 0 !important;
    right: 0 !important;
    width: 120px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    z-index: 3 !important;
    pointer-events: none !important;
  }

  /* FIXED: no more &-checkbox */
  .switch-button-checkbox {
    cursor: pointer !important;
    position: absolute !important;
    inset: 0 !important;
    opacity: 0 !important;
    z-index: 2 !important;

    &:checked + .switch-button-label::before {
      transform: translateX(120px) !important;
    }
  }

  .switch-button-label {
    position: relative !important;
    padding: 3px 0 !important;
    display: block !important;
    user-select: none !important;

    &::before {
      content: "" !important;
      background: #5a7ea6 !important;
      height: 100% !important;
      width: 100% !important;
      position: absolute !important;
      inset: 0 !important;
      border-radius: 30px !important;
      transition: transform 300ms !important;
    }

    .switch-button-label-span {
      position: relative !important;
    }
  }
}



.loader {
  width: 22px;
  height: 22px;
  padding: 8px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #25b09b;
  justify-self: center;
  --_m: 
    conic-gradient(#0000 10%,#000),
    linear-gradient(#000 0 0) content-box;
  -webkit-mask: var(--_m);
          mask: var(--_m);
  -webkit-mask-composite: source-out;
          mask-composite: subtract;
  animation: l3 1s infinite linear;
}
@keyframes l3 {to{transform: rotate(1turn)}}
    .table-container {
      position: relative;
      padding: 20px;
    }

    .controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      gap: 20px;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 300px;
      max-width: 500px;
    }

    .search-icon {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 18px;
    }

    .search-input {
      width: 100%;
      padding: 12px 45px 12px 45px;
      background: #1a1a1a;
      border: 2px solid #5a7ea6;
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: #a2cd96;
      box-shadow: 0 0 0 3px rgba(162, 205, 150, 0.1);
    }

    .search-input::placeholder {
      color: #666;
    }

    .clear-btn {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      font-size: 18px;
      padding: 5px 10px;
      transition: color 0.2s;
    }

    .clear-btn:hover {
      color: #a2cd96;
    }

    .results-count {
      color: #5a7ea6;
      font-size: 14px;
      white-space: nowrap;
    }

    .table-wrapper {
      overflow-x: auto;
      border-radius: 8px;
      border: 1px solid #5a7ea6;
    }

    .employee-table {
      width: 100%;
      border-collapse: collapse;
      background: #000;
    }

    .employee-table thead {
      background: #5a7ea6;
      color: #000;
    }

    .employee-table th {
      padding: 15px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
      white-space: nowrap;
    }

    .employee-table th.sortable {
      cursor: pointer;
      user-select: none;
      transition: background 0.2s;
    }

    .employee-table th.sortable:hover {
      background: #6a8eb6;
    }

    .sort-indicator {
      margin-left: 5px;
      font-size: 12px;
    }

    .employee-table tbody tr {
      border-bottom: 1px solid #333;
      transition: background 0.2s;
    }

    .employee-table tbody tr:hover {
      background: rgba(90, 126, 166, 0.1);
    }

    .employee-table td {
      padding: 15px;
      color: #fff;
      font-size: 14px;
    }

    .name-cell {
      font-weight: 500;
      color: #a2cd96;
    }

    .amount {
      text-align: right;
      font-family: 'Courier New', monospace;
    }

    .deduction {
      color: #ff6b6b;
    }

    .net-salary {
      color: #a2cd96;
      font-weight: 600;
    }

    .download-btn {
      background: linear-gradient(135deg, #5a7ea6, #4a6e96);
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.3s ease;
      white-space: nowrap;
      width: 100px;
      height: 40px;
      min-width: 100px
    }

    .download-btn:hover {
      background: linear-gradient(135deg, #6a8eb6, #5a7ea6);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(90, 126, 166, 0.4);
    }

    .download-btn:active {
      transform: translateY(0);
    }

    .no-data {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .no-data-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    .no-data h3 {
      color: #5a7ea6;
      margin-bottom: 10px;
      font-size: 20px;
    }

    .no-data p {
      color: #666;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .controls {
        flex-direction: column;
        align-items: stretch;
      }

      .search-box {
        max-width: 100%;
      }

      .results-count {
        text-align: center;
      }
    }
  `]
})
export class EmployeeTableComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  searchTerm = '';
  sortField: SortField | null = null;
  sortDirection: SortDirection = 'asc';
  downloading: boolean = true;
  isDownloadingAll: boolean = false;
  isSendingAll: boolean = false;
  is2ShadesSelected: boolean = false;
  showNetSalary: boolean = true;

  toggleNetSalary() {
    this.showNetSalary = !this.showNetSalary;
  }
  constructor(
    private employeeService: EmployeeService,
    private payslipService: PayslipService,
    private googleService: GoogleApiService
  ) { }

  ngOnInit() {
    this.employeeService.employees$.subscribe(employees => {
      this.employees = employees;
      this.applyFilters();
    });
  }

  isSignedIn(): boolean {
    return this.googleService.isSignedIn();
  }
  applyFilters() {
    let filtered = [...this.employees];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(term) ||
        emp.designation.toLowerCase().includes(term)
      );
    }

    if (this.sortField) {
      filtered.sort((a, b) => {
        const aVal = a[this.sortField!];
        const bVal = b[this.sortField!];

        let comparison = 0;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          comparison = aVal.localeCompare(bVal);
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal;
        }

        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    this.filteredEmployees = filtered;
  }

  sort(field: SortField) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  getSortIndicator(field: SortField): string {
    if (this.sortField !== field) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilters();
  }

  calculateAllowances(employee: Employee): number {
    return (
      employee.houseRentAllowance +
      employee.utilityAllowance +
      employee.medicalAllowance +
      employee.conveyanceAllowance +
      employee.arrears +
      employee.bonus +
      employee.increment
    );
  }

  calculateDeductions(employee: Employee): number {
    return (
      employee.incomeTax +
      employee.loanDeduction +
      employee.eobi +
      employee.otherDeductions
    );
  }

  calculateNetSalary(employee: Employee): number {
    return employee.totalGrossSalary - this.calculateDeductions(employee);
  }

  async downloadPayslip(employee: Employee) {
    employee.downloading = true
    await this.payslipService.generatePayslipPDF(employee, this.is2ShadesSelected);
    employee.downloading = false
    this.employeeService.updateEmployee(employee);
  }

  async sendPayslip(employee: Employee) {
    employee.sendingEmail = true
    await this.payslipService.sendPayslipPDF(employee, this.is2ShadesSelected);
    // employee.sendingEmail = false
  }

  onToggle(event: any) {
    const isChecked = event.target.checked;
    this.is2ShadesSelected = isChecked ? true : false;
    console.log('Selected:', this.is2ShadesSelected);
  }

  async downloadAll() {
    if (!this.filteredEmployees?.length) return;
    this.isDownloadingAll = true;
    for (const emp of this.filteredEmployees) {
      emp.downloading = true;
      try {
        await this.payslipService.generatePayslipPDF(emp, this.is2ShadesSelected);
      } catch (err) {
        console.error(`Failed for ${emp.name}`, err);
      }
      emp.downloading = false;
    }
    this.isDownloadingAll = false;
  }

  get showEmailColumn(): boolean {
    return this.filteredEmployees?.some(emp => !!emp.email);
  }

  clearData() {
    localStorage.removeItem('employees');
    window.location.reload();
  }
}
