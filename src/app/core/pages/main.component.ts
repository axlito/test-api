import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ApiUrlService} from '../services/api-url.service';
import {HttpClient} from "@angular/common/http";
import {CategoryInterface} from "../interfaces/category.interface";
import {FormControl, FormGroup, Validators} from "@angular/forms";

const slideLeft = 'animate-fade-in-left';
const slideRight = 'animate-fade-in-right';

@Component({
  selector: 'app-main-page',
  styleUrls: ['./main.component.scss'],
  templateUrl: './main.component.html'
})

export class MainPageComponent implements OnInit {

  @ViewChild('tabsContainer') applyContainer!: ElementRef<HTMLDivElement>;
  animationIndex: number = 0;

  isUpdating: boolean = false;
  isDeleting: boolean = false;
  categoryId: number = -1;
  itemPosition: number = -1;

  categories$ = new BehaviorSubject<CategoryInterface[]>([]);

  public categoryParams = {
    pageNo: 0,
    pageSize: 5,
    filters: null
  };

  readonly category_form = new FormGroup({
    name: new FormControl<string>('', [Validators.required, Validators.maxLength(20), Validators.minLength(1)]),
    description: new FormControl<string>('', [Validators.required, Validators.minLength(1)]),
  });

  constructor(
    private render2: Renderer2,
    private httpClient: HttpClient,
    private apiUrlService: ApiUrlService,
  ) {
  }


  ngOnInit(): void {
    this.loadCategories();
  }

  validCategoryForm() {
    return this.category_form.valid;
  }

  manageCategory(isUpdating: boolean, id: number) {

    if (this.category_form.valid) {

      if (isUpdating && this.categoryId !== -1) {
        this.httpClient.put(`${this.apiUrlService.categoryURL}/${id}`, this.category_form.value)
          .subscribe({
            next: (res: any) => {
              if (res) {
                const array = this.categories$.getValue();
                array[this.itemPosition] = res;
                this.categories$.next(array);
                this.cancelUpdate()
              }
            },
            error: () => console.log('Error'),
            complete: () => console.log('Complete')
          });
      } else {
        this.httpClient.post(`${this.apiUrlService.categoryURL}`, this.category_form.value)
          .subscribe({
            next: (res) => {
              this.loadCategories();
            },
            error: () => console.log('Error'),
            complete: () => console.log('Complete')
          });
      }

    }
  }

  deleteCategory() {
    this.httpClient.post(`${this.apiUrlService.categoryURL}/${this.categoryId}/Remove`, '')
      .subscribe({
        next: (res) => {
          const data = this.categories$.getValue();
          data.splice(this.itemPosition, 1)
          this.categories$.next(data);
          this.cancelDelete();
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


  toUpdate(category: CategoryInterface, pos: number) {
    this.isUpdating = true;
    this.categoryId = category?.id || -1;
    this.itemPosition = pos || -1;
    this.category_form.patchValue({
      name: category.name,
      description: category.description,
    });
  }

  cancelUpdate() {
    this.isUpdating = false;
    this.categoryId = -1;
    this.category_form.reset();
  }

  toDelete(category: CategoryInterface, pos: number) {
    this.isDeleting = true;
    this.categoryId = category?.id || -1;
    this.itemPosition = pos || -1;
  }

  cancelDelete() {
    this.isDeleting = false;
    this.categoryId = -1;
    this.category_form.reset();
  }





  cycleTabs(tabPosition: number) {
    if (!(this.animationIndex === tabPosition)) {
      if (this.animationIndex === 0) {
        this.animationIndex = 1;
        this.render2.addClass(this.applyContainer.nativeElement, slideRight);
        setTimeout(
          () =>
            this.render2.removeClass(
              this.applyContainer.nativeElement,
              slideRight
            ),
          1001
        );
      } else if (this.animationIndex === 1) {
        this.animationIndex = 0;
        this.render2.addClass(this.applyContainer.nativeElement, slideLeft);
        setTimeout(
          () =>
            this.render2.removeClass(
              this.applyContainer.nativeElement,
              slideLeft
            ),
          1001
        );
      }
    }
  }

}







