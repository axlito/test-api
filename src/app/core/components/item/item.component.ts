import {Component, OnInit, Renderer2} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {BehaviorSubject, Subject, takeUntil} from "rxjs";
import {CategoryInterface} from "../../interfaces/category.interface";
import {ItemInterface} from "../../interfaces/item.interface";
import {HttpClient} from "@angular/common/http";
import {DataService} from "../../services/data.service";
import {ApiUrlService} from "../../services/api-url.service";

@Component({
  selector: 'app-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './item.component.html',
  styleUrls: ['../../pages/main.component.scss']
})
export class ItemComponent implements OnInit {

  isUpdating: boolean = false;
  isDeleting: boolean = false;
  itemId: string = '-1';
  public operationResult: string = '';

  destroy$ = new Subject<void>();

  categories$ = new BehaviorSubject<CategoryInterface[]>([]);
  items$ = new BehaviorSubject<ItemInterface[]>([]);

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

  get validItemForm() {
    return this.item_form.valid;
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
                this.reloadData();
                this.cancelAction()
              }
            }
          });
      } else {
        this.httpClient.post(`${this.apiUrlService.itemURL}`, this.item_form.value)
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

  deleteItem() {
    this.httpClient.post(`${this.apiUrlService.itemURL}/${this.itemId}/Remove`, '')
      .subscribe({
        next: () => {
          this.reloadData();
          this.cancelAction();
        }
      });
  }

  toUpdate(element: ItemInterface) {
    this.isUpdating = true;
    const itemCategory = this.dataService.categories.find((c) => element.category === c.name)?.id
    this.itemId = element?.id || '-1';
    this.item_form.patchValue(<ItemInterface>{
      ...element,
      categoryId: itemCategory,
    });
    this.item_form.get('categoryId')?.disable();
    this.item_form.controls.categoryId.setValidators([]);
    this.item_form.updateValueAndValidity();
  }

  toDelete(element: ItemInterface) {
    this.isDeleting = true;
    this.itemId = element.id || '-1';
  }

  cancelAction() {
    this.isUpdating = false;
    this.isDeleting = false;
    this.itemId = '-1';
    this.item_form.get('categoryId')?.enable();
    this.item_form.controls.categoryId.setValidators([Validators.required]);
    this.item_form.updateValueAndValidity();
    this.item_form.reset();
  }

}
