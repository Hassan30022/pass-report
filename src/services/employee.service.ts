import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  public employees$ = this.employeesSubject.asObservable();

  constructor() {
    this.loadFromLocalStorage();
  }

  setEmployees(employees: Employee[]) {
    this.employeesSubject.next(employees);
    localStorage.setItem('employees', JSON.stringify(employees));
  }

  getEmployees(): Employee[] {
    return this.employeesSubject.value;
  }

  private loadFromLocalStorage() {
    const stored = localStorage.getItem('employees');
    if (stored) {
      this.employeesSubject.next(JSON.parse(stored));
    }
  }

  updateEmployee(updated: Employee) {
    const cleaned = { ...updated };
    delete cleaned.downloading;
    delete cleaned.sendingEmail;

    const list = this.getEmployees();
    const index = list.findIndex(e => e.id === updated.id);

    if (index !== -1) {
      list[index] = cleaned;
      this.setEmployees([...list]);
    }
  }

  parseExcelData(data: any[]): Employee[] {
    return data.map((row, index) => ({
      id: row['Employee ID'] || row['ID'] || '',
      name: row['Employee Name'] || row['Name'] || '',
      designation: row['designation'] || row['Designation'] || '',
      salaryMonth: row['salaryMonth'] || row['Salary Month'] || '',
      basicSalary: this.parseNumber(row['Basic Salary'] || row['basicSalary']),
      houseRentAllowance: this.parseNumber(row['House Rent Allowance'] || row['houseRentAllowance']),
      utilityAllowance: this.parseNumber(row['Utility Allowance'] || row['utilityAllowance']),
      medicalAllowance: this.parseNumber(row['Medical Allowance'] || row['medicalAllowance']),
      conveyanceAllowance: this.parseNumber(row['Conveyance Allowance'] || row['conveyanceAllowance']),
      arrears: this.parseNumber(row['Arrears'] || row['arrears']),
      grossSalary: this.parseNumber(row['Gross Salary'] || row['grossSalary']),
      bonus: this.parseNumber(row['Bonus'] || row['bonus']),
      increment: this.parseNumber(row['Increment'] || row['increment']),
      totalGrossSalary: this.parseNumber(row['Total Gross Salary'] || row['totalGrossSalary']),
      incomeTax: this.parseNumber(row['IncomeTax'] || row['Income Tax']),
      loanDeduction: this.parseNumber(row['Loan Deduction'] || row['loanDeduction']),
      eobi: this.parseNumber(row['EOBI'] || row['eobi']),
      otherDeductions: this.parseNumber(row['Other Deductions'] || row['otherDeductions']),
      totalDeductions: this.parseNumber(row['Total Deductions'] || row['totalDeductions']),
      netPay: this.parseNumber(row['Net Pay'] || row['netPay']),
      inWords: row['In Words'] || row['inWords'] || row['In words'],
      email: row['Email Address'] || row['Email'] || row['email'],
      dependabilityAllowances: row['Dependability Allowances'] || '',
      punctualityAllowances: row['Punctuality Allowances'] || '',
      mannedMinutesAllowances: row['Manned Minutes Allowances'] || '',
      leaveDeductions: row['Leave Deduction'] || '',
    }));
  }

  private parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^0-9.-]/g, '');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  }
}
