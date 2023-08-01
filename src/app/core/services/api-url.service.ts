import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class ApiUrlService {

  private readonly _apiUrl: string;

  constructor() {
    this._apiUrl = 'https://3q8pjz0cpl.execute-api.us-east-1.amazonaws.com';
  }

  get apiUrl(): string {
    return this._apiUrl;
  }

  get categoryURL() {
    return `${this.apiUrl}/api/Category`;
  }

  get categorySearchURL() {
    return `${this.categoryURL}/Search`;
  }

  get itemURL() {
    return `${this.apiUrl}/api/Item`;
  }

  get itemSearchURL() {
    return `${this.categoryURL}/Search`;
  }


}
