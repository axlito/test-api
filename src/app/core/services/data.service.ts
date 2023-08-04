import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ApiUrlService} from "./api-url.service";
import {BehaviorSubject, forkJoin, tap} from "rxjs";
import {CategoryInterface} from "../interfaces/category.interface";
import {ItemInterface} from "../interfaces/item.interface";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private _searchParams = {
    pageNo: 0,
    pageSize: 50,
    filters: null
  };

  private _categories = new BehaviorSubject<CategoryInterface[]>([]);
  private _items = new BehaviorSubject<ItemInterface[]>([]);

  constructor(
    private httpClient: HttpClient,
    private apiUrlService: ApiUrlService,
  ) {
  }

  get categories(): CategoryInterface[] {
    return this._categories.value;
  }

  get items(): ItemInterface[] {
    return this._items.value;
  }

  set updateCategories(newValue: CategoryInterface[]) {
    this._categories.next(newValue);
  }

  set updateItems(newValue: ItemInterface[]) {
    this._items.next(newValue);
  }

  public loadData = () => {

    return forkJoin([
      this.httpClient.post<any>(this.apiUrlService.categorySearchURL, this._searchParams),
      this.httpClient.post<any>(this.apiUrlService.itemSearchURL, this._searchParams)
    ]).pipe(
      tap(([res1, res2]) => {
        this.updateCategories = res1.items;
        this.updateItems = res2.items;
      }));

  };

}
