import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MainPageComponent} from './pages/main.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CategoryComponent} from "./components/category/category.component";
import {ItemComponent} from "./components/item/item.component";

@NgModule({
  declarations: [
    MainPageComponent,
  ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CategoryComponent,
        ItemComponent
    ],
  exports: [
    MainPageComponent,
  ]
})
export class CoreModule {
}
