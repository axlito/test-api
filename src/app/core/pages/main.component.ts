import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {BehaviorSubject, Subject, takeUntil} from 'rxjs';
import {HttpClient} from "@angular/common/http";
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

  loading$ = new BehaviorSubject<boolean>(true);
  destroy$ = new Subject<void>();

  constructor(
    private render2: Renderer2,
    private httpClient: HttpClient,
    private dataService: DataService,
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
      }, 2000));

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







