import { Component } from '@angular/core';
import { StoreHelper } from '../services';

@Component({
  selector: 'left-panel',
  styles: [`
    .panel {
      width:360px;
      margin-right:35px;
      background:white;
      border: 1px solid #f4f7f8;
      border-radius: 10px;
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

    .margin-auto {
      margin: auto;
    }
    .relative{
      position:relative;
    }
  `],
  template: `
  <div class="relative">
    <div *ngIf="!collapsed" class="panel" >
      <progress-panel *ngIf="progress" (onPageChange)="changePage()"></progress-panel>
      <degree-select *ngIf="!progress" (onPageChange)="changePage()"></degree-select>
      <div class="no-select expand" (click)="collapse()">
        <div class="margin-auto">
         &lt;
        </div>
      </div>
    </div>
    <div *ngIf="collapsed" class="absolute-half expand" (click)="collapse()" >
      <div class="margin-auto">
        &gt;
      </div>
    </div>
  </div>
  `
})

export class LeftPanelContainer {
  private progress = false;
  private collapsed = false;

  constructor(private storeHelper: StoreHelper) {
  }

  private ngOnInit() {
    this.progress = this.storeHelper.current('page');
    this.collapsed = this.storeHelper.current('collapsed');
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
