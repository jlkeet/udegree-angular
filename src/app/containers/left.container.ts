import { Component } from '@angular/core';
import { StoreHelper } from '../services';

import { HostListener } from "@angular/core";
import { MatTabsModule } from '@angular/material';

@Component({
  selector: 'left-panel',
  styles: [`
    .panel {
      width:360px;
      margin-right:35px;
      background:white;
      border: 1px solid #f4f7f8;
      border-radius: 10px;
      margin-top: 10px;
    }

   .panel-mobile {
      background:white;
      border: 1px solid #f4f7f8;
      border-radius: 10px;
      margin-top: 10px;
    }

    .expand {
      background: #eee;
      height: 100px;
      color:black;
      display:flex;
      border-radius: 0px 10px 10px 0px;
      width:20px;
      position:absolute;
      top:10px;
      right:15px;
      cursor:pointer;
    }

    .expand:hover {
      background: #dedede;
    }

    .margin-auto {
      margin: auto;
    }
    .relative{
      position:relative;
    }
  `],
  template: `
  <div *ngIf="!mobile" class="relative">
    <div class="panel" >
      <progress-panel (onPageChange)="changePage()"></progress-panel>
    </div>
  </div>

  <div *ngIf="mobile" class="relative" (touchstart)="swipe($event, 'start')" (touchend)="swipe($event, 'end')">
  <mat-tab-group mat-align-tabs="start" [(selectedIndex)]="selectedTab">
  <mat-tab label="First">
  <div class="panel-mobile">
    <progress-panel (onPageChange)="changePage()"></progress-panel>
  </div>
  </mat-tab>
  <mat-tab label="Second">  
    <planner-container-mobile></planner-container-mobile>
  </mat-tab>
  </mat-tab-group>
</div>
  `
})



export class LeftPanelContainer {
  private progress = false;
  private collapsed = false;
  public mobile = false;
  private screenHeight;
  private screenWidth;

  private swipeCoord;
  private swipeTime;
  private selectedTab = 0;

  constructor(private storeHelper: StoreHelper) {
    this.onResize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
     this.screenHeight = window.innerHeight;
     this.screenWidth = window.innerWidth;


     if (this.screenWidth < 768) {
      this.mobile = true;
     } else {
       this.mobile = false;
     }
  }

 private swipe(e: TouchEvent, when: string): void {
    const coord: [number, number] = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
    const time = new Date().getTime();
   if (when === 'start') {
    this.swipeCoord = coord;
    this.swipeTime = time;
    } else if (when === 'end') {
    const direction = [coord[0] - this.swipeCoord[0], coord[1] - this.swipeCoord[1]];
    const duration = time - this.swipeTime;
   if (duration < 1000 //
    && Math.abs(direction[0]) > 30 // Long enough
    && Math.abs(direction[0]) > Math.abs(direction[1] * 3)) { // Horizontal enough
    const swipe = direction[0] < 0 ? 'next' : 'previous';
    console.info(swipe);
    if(swipe === 'next'){
    const isFirst = this.selectedTab === 0;
   if(this.selectedTab <= 3){
    this.selectedTab = isFirst ? 1 : this.selectedTab + 1;
   }
   console.log("Swipe left — INDEX: " + this.selectedTab);
    } else if(swipe === 'previous'){
    const isLast = this.selectedTab === 1;
   if(this.selectedTab >= 1){
    this.selectedTab = this.selectedTab - 1;
    }
   console.log("Swipe right — INDEX: " + this.selectedTab);
    }
   // Do whatever you want with swipe
    }
    }
   }


  private ngOnInit() {
    this.progress = this.storeHelper.current('page');
    this.collapsed = this.storeHelper.current('collapsed');

    if (this.screenWidth < 768) {
      this.mobile = true;
    }

  }

  private changePage() {
    const page = this.storeHelper.update('page', !this.progress);
    this.progress = !this.progress;
  }

  private collapse() {
    const collapsed = this.storeHelper.update('collapsed', !this.collapsed);
    this.collapsed = !this.collapsed;
  }
}
