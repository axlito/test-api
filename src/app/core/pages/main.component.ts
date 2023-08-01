import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {ApiUrlService} from '../services/api-url.service';
import {HttpClient} from "@angular/common/http";
import {CategoryInterface} from "../interfaces/category.interface";


@Component({
  selector: 'app-main-page',
  styleUrls: ['./main.component.scss'],
  templateUrl: './main.component.html'
})

export class MainPageComponent implements OnInit {

  isUpdating: boolean = false;
  categoryId: number = -1;

  categories$ = new BehaviorSubject<CategoryInterface[]>([]);

  public categoryObject: CategoryInterface = {
    name: '',
    description: '',
  };

  public categoryParams = {
    pageNo: 0,
    pageSize: 5,
    filters: null
  };

  constructor(
    private httpClient: HttpClient,
    private apiUrlService: ApiUrlService,
  ) {
  }


  ngOnInit(): void {
    this.loadCategories();
  }

  validCategoryForm() {
    return (this.categoryObject.name && this.categoryObject.description)
  }

  manageCategory(isUpdating: boolean, id: number) {
    if (this.categoryObject.name && this.categoryObject.description) {

      if (isUpdating && this.categoryId !== -1) {
        this.httpClient.put(`${this.apiUrlService.categoryURL}/${id}`, this.categoryObject)
          .subscribe({
            next: (res) => {
              console.log(res)
            },
            error: () => console.log('Error'),
            complete: () => console.log('Complete')
          });
      } else {
        this.httpClient.post(`${this.apiUrlService.categoryURL}`, this.categoryObject)
          .subscribe({
            next: (res) => {
              console.log(res)
            },
            error: () => console.log('Error'),
            complete: () => console.log('Complete')
          });
      }
    }
  }

  deleteCategory(category: CategoryInterface) {
    this.httpClient.post(`${this.apiUrlService.categoryURL}/${category.id}/Remove`, '')
      .subscribe({
        next: (res) => {
          console.log(res)
        },
        error: () => console.log('Error'),
        complete: () => console.log('Complete')
      });
  }

  loadCategories() {
    this.httpClient.post(`${this.apiUrlService.categorySearchURL}`, this.categoryParams)
      .subscribe((items: any) => {
        this.categories$.next(items.items);
        this.categoryParams = {
          pageNo: items.pageNo,
          pageSize: items.pageSize,
          filters: items.filters
        }
      });
  }


  toUpdate(category: CategoryInterface) {
    this.isUpdating = true;
    this.categoryId = category?.id || -1;
    this.categoryObject = {
      name: category.name,
      description: category.description,
    }
  }

  cancelUpdate(category: CategoryInterface) {
    this.isUpdating = false;
    this.categoryId = -1;
    this.categoryObject = {
      name: '',
      description: '',
    }
  }

}
