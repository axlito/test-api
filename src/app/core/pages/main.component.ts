import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {BehaviorSubject, Subject, takeUntil} from 'rxjs';
import {ApiUrlService} from '../services/api-url.service';
import {HttpClient} from "@angular/common/http";
import {CategoryInterface} from "../interfaces/category.interface";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ItemInterface} from "../interfaces/item.interface";
import {DataService} from "../services/data.service";


const slideLeft = 'animate-fade-in-left';
const slideRight = 'animate-fade-in-right';

@Component({
  selector: 'app-main-page',
  styleUrls: ['./main.component.scss'],
  templateUrl: './main.component.html',
})

export class MainPageComponent implements OnInit {

  @ViewChild('tabsContainer') applyContainer!: ElementRef<HTMLDivElement>;
  animationIndex: number = 0;

  isUpdating: boolean = false;
  isDeletingCategory: boolean = false;
  isDeletingItem: boolean = false;
  categoryId: string = '-1';
  itemId: string = '-1';
  itemPosition: number = -1;
  public operationResult: string = '';

  loading$ = new BehaviorSubject<boolean>(true);
  destroy$ = new Subject<void>();

  categories$ = new BehaviorSubject<CategoryInterface[]>([]);
  items$ = new BehaviorSubject<ItemInterface[]>([]);

  readonly category_form = new FormGroup({
    name: new FormControl<string>('', [Validators.required, Validators.maxLength(20), Validators.minLength(1)]),
    description: new FormControl<string>('', [Validators.required, Validators.minLength(1)]),
  });

  readonly item_form = new FormGroup({
    code: new FormControl<string>('', Validators.required),
    name: new FormControl<string>('', Validators.required),
    description: new FormControl<string>('', Validators.required),
    defaultPrice: new FormControl<number>(0),
    defaultCost: new FormControl<number>(0),
    categoryId: new FormControl<string>('', Validators.required)
  });


  constructor(
    private render2: Renderer2,
    private httpClient: HttpClient,
    private dataService: DataService,
    private apiUrlService: ApiUrlService,
  ) {
  }


  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading$.next(true)
    this.dataService.loadData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => setTimeout(() => {
        this.loading$.next(false);
        this.categories$.next(this.dataService.categories);
        this.items$.next(this.dataService.items);
      }, 2000));

  }

  validCategoryForm() {
    return this.category_form.valid;
  }

  validItemForm() {
    return this.item_form.valid;
  }

  categoryContainsItems(category: CategoryInterface) {
    return this.dataService.items.filter((i) => category.name === i.category).length;
  }

  manageCategory(isUpdating: boolean, id: string) {
    if (this.category_form.valid) {
      if (isUpdating && this.categoryId !== '-1') {
        this.httpClient.put(`${this.apiUrlService.categoryURL}/${id}`, this.category_form.value)
          .subscribe({
            next: ({message}: any) => {
              this.operationResult = message;
              if (message === '') {
                this.loadData();
                this.cancelUpdate()
              }
            }
          });
      } else {
        this.httpClient.post(`${this.apiUrlService.categoryURL}`, this.category_form.value)
          .subscribe({
            next: ({message}: any) => {
              this.operationResult = message;
              if (message === '') {
                this.loadData();
              }
            }
          });
      }
    }
  }

  manageItem(isUpdating: boolean, id: string) {
    if (this.item_form.valid) {
      if (isUpdating && this.itemId !== '-1') {
        this.httpClient.put(`${this.apiUrlService.itemURL}/${id}`,
          {
            code: this.item_form.controls.code.value,
            name: this.item_form.controls.name.value,
            description: this.item_form.controls.description.value,
            defaultPrice: this.item_form.controls.defaultPrice.value,
            defaultCost: this.item_form.controls.defaultCost.value
          }
        )
          .subscribe({
            next: ({message}: any) => {
              this.operationResult = message;
              if (message === '') {
                this.loadData();
                this.cancelUpdate()
              }
            }
          });
      } else {
        this.httpClient.post(`${this.apiUrlService.itemURL}`, this.item_form.value)
          .subscribe({
            next: ({message}: any) => {
              this.operationResult = message;
              if (message === '') {
                this.loadData();
              }
            }
          });
      }
    }
  }

  deleteCategory() {
    this.httpClient.post(`${this.apiUrlService.categoryURL}/${this.categoryId}/Remove`, '')
      .subscribe({
        next: (res) => {
          this.cancelDelete();
          this.loadData();
        }
      });
  }

  deleteItem() {
    this.httpClient.post(`${this.apiUrlService.itemURL}/${this.itemId}/Remove`, '')
      .subscribe({
        next: (res) => {
          this.cancelDelete();
          this.loadData();
        }
      });
  }

  toUpdate(type: 'category' | 'item', element: any, pos: number) {
    this.isUpdating = true;

    switch (type) {
      case 'category':
        this.categoryId = element?.id || '-1';
        this.itemPosition = pos || -1;
        this.category_form.patchValue({
          name: element.name,
          description: element.description,
        });
        break;
      case 'item':
        const itemCategory = this.dataService.categories.find((c) => element.category === c.name)?.id
        this.itemId = element?.id || '-1';
        this.itemPosition = pos || -1;
        this.item_form.patchValue({
          code: element.code,
          name: element.name,
          description: element.description,
          defaultPrice: element.defaultPrice,
          defaultCost: element.defaultCost,
          categoryId: itemCategory,
        });
        this.item_form.get('categoryId')?.disable();
        this.item_form.controls.categoryId.setValidators([]);
        this.item_form.updateValueAndValidity();
        break;
    }

    console.log(this.dataService.items)

  }

  toDelete(type: 'category' | 'item', element: CategoryInterface | ItemInterface, pos: number) {
    switch (type) {
      case 'category':
        this.isDeletingCategory = true;
        this.categoryId = element?.id || '-1';
        break;
      case 'item':
        this.isDeletingItem = true;
        this.itemId = element?.id || '-1';
        break;
    }
    this.itemPosition = pos || -1;
  }

  cancelUpdate() {
    this.isUpdating = false;
    this.categoryId = '-1';
    this.itemId = '-1';
    this.item_form.get('categoryId')?.enable();
    this.item_form.controls.categoryId.setValidators([Validators.required]);
    this.item_form.updateValueAndValidity();
    this.category_form.reset();
    this.item_form.reset();
  }

  cancelDelete() {
    this.isDeletingCategory = false;
    this.isDeletingItem = false;
    this.categoryId = '-1';
    this.itemId = '-1';
    this.category_form.reset();
    this.item_form.reset();
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







