import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainPageComponent } from './pages/main.component';

@NgModule({
  declarations: [
    MainPageComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    MainPageComponent,
  ]
})
export class CoreModule { }
