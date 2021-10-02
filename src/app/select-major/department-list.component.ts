import { Component, EventEmitter, Input, Output } from '@angular/core';

/*
    Displays a list of department tiles.
    In theory this could get way more complicated
    But it looks like UoA might've stopped minors altogether

    This should be reworked to give a bit more flexibility,
    It's currently very specific for two major, one minor

    Also needs a better styling
 */
@Component({
  selector: 'department-list',
  styles: [
    `
    .dept-list{
        display: flex;
        flex-direction: column;

    }
    .dept-list h2 { text-align:center }
    .departments-container {
        display: flex;
        flex-direction: row;
        flex-wrap:wrap;
        justify-content: center;
    }
    .dept {
        box-sizing: border-box;
        height: 50px;
        width: 300px;
        border: 1px solid grey;
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin: 10px;
        background-color: rgb(120,144,156);
    }
    .dept:hover {
        cursor:pointer;
        background: #46b7cc;
        border: 1px solid #46b7cc;
    }

     .dept-text {
            font-weight: 500;
            font-size: 15px;
            z-index: 1;
            text-align: center;
            color: white;
     }
     .light-grey{
      background: #ddd
     }
    `
  ],
  template: `
  <div class='dept-list'>
    <mat-toolbar class="light-grey">
      <span>
        Select Major
      </span>
      <span class="spacer"></span>
      <button mat-raised-button color="accent" routerLink="/planner">
        Back to planner
      </button>
    </mat-toolbar>

    <div>
      <a class='btn' [ngClass] ="{'btn--blue': cur===0}" (click)="cur = 0">
        {{faculty.name}} Major {{majors[0]? " -- " + majors[0].name: ''}}
        <span width="100%">
        </span>
      </a>
      <a *ngIf="majors[0]" class="btn" (click)="deleteDept(0)">
        X
      </a>
    </div>

    <div *ngIf="allowsDoubleMajor && majors[0]">
      <a class="btn" [ngClass] ="{'btn--blue': cur===1}" (click)="cur = 1">
        {{faculty.name}} Second Major {{majors[1]? " -- " + majors[1].name: ''}}
      </a>
      <a *ngIf="majors[1]" class="btn" (click)="deleteDept(1)">
        X
      </a>
    </div>

    <div>
      <a *ngIf="allowsMinor && majors[0]" class="btn" [ngClass] ="{'btn--blue': cur===2}" (click)="cur=2">
        {{faculty.name}} Minor {{minor? " -- " + minor.name: ''}}
      </a>
      <a *ngIf="minor" class="btn" (click)="deleteDept(2)">
        X
      </a>
    </div>

    <div class='departments-container'>
      <div *ngFor='let dept of departments; let i = index'>
        <div class='dept' (click)='clicked(dept)'>
          <span class='dept-text'>{{dept.name}}</span>
        </div>
      </div>
    </div>
  </div>
    `
})

export class DepartmentList {
  @Output() public deptClicked = new EventEmitter();
  @Input() public majors;
  @Input() public departments: any[] = [];
  @Input() public faculty;
  @Input() public allowsMinor: boolean;
  @Input() public allowsDoubleMajor: boolean;

  // current major
  private cur = 0;
  private minor: string = null;

  private deleteDept(which) {
    if (which === 0) {
      this.majors[0] = this.majors[1];
      this.majors[1] = null;
      if (this.majors[0] === null) {
        this.cur = 0;
      }
    } else if (which === 1) {
      this.majors[1] = null;
    } else if (which === 2) {
      this.minor = null;
    }
    this.deptClicked.emit({
      majors: this.majors,
      minor: this.minor
    });
  }

  // would be nice to split this up, but it's slightly awkward
  private clicked(dept) {
    if ((this.cur === 0 && this.majors[1] !== dept ||
      this.cur === 1 && this.majors[0] !== dept) && this.minor !== dept) {
      this.majors[this.cur] = dept;
    } else if (this.cur === 2 && this.majors[0] !== dept && this.majors[1] !== dept) {
      this.minor = dept;
    } else {
      return;
    }
    this.deptClicked.emit({
      majors: this.majors,
      minor: this.minor
    });
  }

}
