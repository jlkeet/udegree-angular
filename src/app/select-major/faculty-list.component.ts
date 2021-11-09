import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FacultyService, ConjointService, StoreHelper } from '../services';

/*
    Simply displays a list of faculty tiles.
*/

@Component({
  selector: 'faculty-list',
  styles: [
    `
    .faculty-list{
      display: flex;
      flex-direction:column;
    }

    .faculty-list h2 {
      text-align:center;
      width: 50%;
      left: 25%;
      top: -40px;
      position: relative;
      margin-bottom: 0px;
    }

    .faculties-container {
      display: flex;
      flex-direction: row;
      flex-wrap:wrap;
      justify-content: center;
      margin: 10px auto;
      width: 100%;
    }

    .faculty {
      box-sizing: border-box;
      height: 100px;
      width: 275px;
      splay: flex;
      flex-direction: column;
      margin: 0 10px 10px 10px;
      box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
      text-align:center;
    }

    .faculty:hover {
      cursor:pointer;
      border: 2px solid #46b7cc;
      width: 275px;
      height: 100px;
      margin-top: -2px;
    }

    .faculty-image {
      height: 220px;
      width: 275px;
      background-size:cover;
    }

    .faculty-text {
      padding-top: 13px;
      padding-left: 13px;
      padding-right: 13px;
      line-height: 20px;
      height:50%;
      color: black;
      justify-content: space-between;
      align-items: center;
    }

    .faculty-icon {
      height: 25px;
      width: 18px;
      background-color: #46b7cc;
      color: white;
      border-radius: 100px;
      line-height: 30px;
      font-size: 20px;
      padding: 2px 6px;
      float: right;
      text-align: center;
      font-family: Hoefler text;
      font-style: italic;
    }

   .back-to-plan {
      width: 80px;
      height: 20px;
      background-color: #46b7cc;
      color: white;
      cursor: pointer;
      line-height: 20px;
      padding: 10px;
      border-radius: 4px;
      box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
      text-decoration: none;
      text-align: center;
      justify-content: space-between;
      align-items: center;
   }
   .website {
     text-decoration:underline;
   }
   .light-gray{
      background:#ddd
   }
    `
  ],
  template: `
    <div class="faculty-list">
      <mat-toolbar class="light-gray">
        <span>
          Select Degree
        </span>
        <span class="spacer"></span>
        <button mat-raised-button color="accent" routerLink="/planner">
          Back to planner
        </button>
      </mat-toolbar>
      <div class="faculties-container">
        <div *ngFor="let faculty of faculties; let i = index">
          <div class="faculty" (click)="clicked(faculty)">
            <div class="faculty-text"> <span>{{faculty.name}}</span></div>
            <div class="website"> <a href="http://www.auckland.ac.nz/"> details </a></div>
          </div>
        </div>
      </div>
    </div>
    `
})

// <div><a class="faculty-icon">i</a></div>
export class FacultyList {
  @Output() public facultyClicked = new EventEmitter();
  private faculties: any[] = [];

  constructor(
    private facultyService: FacultyService,
    private storeHelper: StoreHelper,
    private router: Router
  ) { }

  public clicked(faculty) {
    console.log("faculty list firing")
    this.facultyClicked.emit({
      value: faculty
    });

    // maybe put these in the container
    this.storeHelper.update('requirements', faculty.majorRequirements);

  }

  public ngOnInit() {
    this.faculties = this.facultyService.getFaculties();
    console.log("List is firing")
  }

}
