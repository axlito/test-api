import {Component, OnInit, Renderer2} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BehaviorSubject, Subject, takeUntil} from "rxjs";
import {CategoryInterface} from "../../interfaces/category.interface";
import {ItemInterface} from "../../interfaces/item.interface";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {DataService} from "../../services/data.service";
import {ApiUrlService} from "../../services/api-url.service";

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category.component.html',
  styleUrls: ['../../pages/main.component.scss']
})
export class CategoryComponent implements OnInit {

  isUpdating: boolean = false;
  isDeleting: boolean = false;
  categoryId: string = '-1';
  public operationResult: string = '';

  destroy$ = new Subject<void>();
  categories$ = new BehaviorSubject<CategoryInterface[]>([]);
  items$ = new BehaviorSubject<ItemInterface[]>([]);

  readonly category_form = new FormGroup({
    name: new FormControl<string>('', [Validators.required, Validators.maxLength(20)]),
    description: new FormControl<string>('', Validators.required),
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
    this.categories$.next(this.dataService.categories);
    this.items$.next(this.dataService.items);
  }

  reloadData() {
    this.dataService.loadData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => setTimeout(() => {
        this.loadData();
      }, 2000));
  }

  get validCategoryForm() {
    return this.category_form.valid;
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
                this.reloadData();
                this.cancelAction();
              }
            }
          });
      } else {
        this.httpClient.post(`${this.apiUrlService.categoryURL}`, this.category_form.value)
          .subscribe({
            next: ({message}: any) => {
              this.operationResult = message;
              if (message === '') {
                this.reloadData();
                this.cancelAction();
              }
            }
          });
      }
    }
  }

  deleteCategory() {
    this.httpClient.post(`${this.apiUrlService.categoryURL}/${this.categoryId}/Remove`, '')
      .subscribe({
        next: () => {
          this.reloadData();
          this.cancelAction();
        }
      });
  }

  toUpdate(element: CategoryInterface) {
    this.isUpdating = true;
    this.categoryId = element.id || '-1';
    this.category_form.patchValue(<CategoryInterface>{
      ...element
    });
  }

  toDelete(element: CategoryInterface) {
    this.isDeleting = true;
    this.categoryId = element.id || '-1';
  }

  cancelAction() {
    this.isUpdating = false;
    this.isDeleting = false;
    this.categoryId = '-1';
    this.category_form.reset();
  }

}
