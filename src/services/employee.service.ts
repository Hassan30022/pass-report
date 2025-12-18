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
      return data.map(row => ({
    id: row['ID'] || '',

    studentName: row['Student Name'] || '',
    class: row['Class'] || '',

    totalIslamiatOral: this.parseNumber(row['Islamiat Oral Total']),
    totalIslamiatWritten: this.parseNumber(row['Islamiat Written Total']),
    totalUrduOral: this.parseNumber(row['Urdu Oral Total']),
    totalUrduWritten: this.parseNumber(row['Urdu Written Total']),
    totalEnglishGrammar: this.parseNumber(row['English Grammar Total']),
    totalEnglishWritten: this.parseNumber(row['English Written Total']),
    totalSocialStudies: this.parseNumber(row['Social Studies Total']),
    totalScience: this.parseNumber(row['Science Total']),
    totalMath: this.parseNumber(row['Mathematics Total']),
    totalBioComputer: this.parseNumber(row['Bio/Computer Total']),
    totalPhysics: this.parseNumber(row['Physics Total']),
    totalChemistry: this.parseNumber(row['Chemistry Total']),
    totalSindhi: this.parseNumber(row['Sindhi Total']),
    totalGeneralKnowledge: this.parseNumber(row['General Knowledge Total']),
    totalDrawing: this.parseNumber(row['Drawing Total']),

    obtIslamiatOral: this.parseNumber(row['Islamiat Oral Obtained']),
    obtIslamiatWritten: this.parseNumber(row['Islamiat Written Obtained']),
    obtUrduOral: this.parseNumber(row['Urdu Oral Obtained']),
    obtUrduWritten: this.parseNumber(row['Urdu Written Obtained']),
    obtEnglishGrammar: this.parseNumber(row['English Grammar Obtained']),
    obtEnglishWritten: this.parseNumber(row['English Written Obtained']),
    obtSocialStudies: this.parseNumber(row['Social Studies Obtained']),
    obtScience: this.parseNumber(row['Science Obtained']),
    obtMath: this.parseNumber(row['Mathematics Obtained']),
    obtBioComputer: this.parseNumber(row['Bio/Computer Obtained']),
    obtPhysics: this.parseNumber(row['Physics Obtained']),
    obtChemistry: this.parseNumber(row['Chemistry Obtained']),
    obtSindhi: this.parseNumber(row['Sindhi Obtained']),
    obtGeneralKnowledge: this.parseNumber(row['General Knowledge Obtained']),
    obtDrawing: this.parseNumber(row['Drawing Obtained']),

    totalMarks: this.parseNumber(row['Total Marks']),
    obtainedMarks: this.parseNumber(row['Obtained Marks']),
    percentage: this.parseNumber(row['Percentage']),
    grade: row['Grade'] || '',
    results: row['Result'] || '',
    remarks: row['Remarks'] || '',
    email: row['Email'] || '',
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
