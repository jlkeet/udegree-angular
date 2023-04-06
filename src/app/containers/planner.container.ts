import { Component, ViewEncapsulation } from '@angular/core';
import 'rxjs/Rx';
import { Store } from '../app.store';
import { ICourse } from '../interfaces';
import {
  ClickedEvent,
  CourseService,
  IRequirement,
  MovedEvent,
  RemovedEvent,
  RequirementService,
  StoreHelper
} from '../services';

import { AppHeader } from '../app.header.component';
import * as confetti from 'canvas-confetti';
import { FirebaseDbService } from '../core/firebase.db.service';
import { SamplePlanService } from '../services/sample-plan.service';


/*
  Container for the planning page.
  This container will respond to changes in the store.
 */
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'planner-container',
  // TODO review styles
  styles: [
    `
    .planner-container {
        display: flex;
        flex-direction: row;
        width: 100%;
    }
    .fullwidth {
      width: 100%;
    }

    .planner-container-mobile {
      flex-direction: row;
      width: 100%;
  }
  .fullwidth-mobile {
    width: 100%;
  }

  .do-it-button {
    width: 25%;
    display: flex;
    margin-top: -27px;
    padding-left: 36px;
  }

  `
  ],
  template: `
        <div *ngIf="!isMobile" class='planner-container'>

          <left-panel></left-panel>

          <div class='flex flex-col relative fullwidth'>
            <div class="do-it-button">
              <button (click)="samplePlan()">DO IT FOR ME</button>
            </div>
              <course-details *ngIf='selected' [showAddCourse]='false' [course]='selected'
              (cancelClicked)='cancelCourse($event)'
              (changeStatus)='changeStatus($event)' (changeGrade)='changeGrade($event)'
              [messages]="messages" (deleteClicked)='deleteCourse($event)'
              ></course-details>
              <courses-panel  [courses]='planned' (courseMoved)='handleCourseMoved($event)'
              (courseRemoved)='handleCourseRemoved($event)' (courseClicked)='handleCourseClicked($event)'>
              </courses-panel>
          </div>
        </div>


        <div *ngIf="isMobile" class='planner-container-mobile'>
        <left-panel></left-panel>
      </div>

  `
})
export class PlannerContainer {

  private planned: ICourse[] = [];
  private messages: string[] | any[] = []; 
  private majorSelected: boolean = false;
  private selected: ICourse = null;
  private sub;
  public isMobile;

  constructor(
    private requirementService: RequirementService,
    private storeHelper: StoreHelper,
    private store: Store,
    private courseService: CourseService,
    private appHeader: AppHeader,
    public dbCourses: FirebaseDbService,
    public samplePlanService: SamplePlanService,
  ) {
    this.isMobile = appHeader.mobile;
  }

  public ngOnInit() {
    this.sub = this.store.changes.pluck('courses').
      subscribe( (courses: ICourse[]) => this.planned = courses);
  }

  public ngOnDestroy() {
    this.sub.unsubscribe();
 }

  public handleCourseMoved(event: MovedEvent) {
    // move course to another semester
    this.courseService.moveCourse(event.courseId, event.period, event.year);
  }
  public handleCourseRemoved(event: RemovedEvent) {
    
    // This calls the Firebase audit-log previous value on course deletion
    this.dbCourses.setAuditLogDeleteCourse(event.course.name);

    // remove course from semester
    this.courseService.deselectCourseByName(event.course);
  }

  public handleCourseClicked(event: ClickedEvent) {
    // remove course from semester
    const course = event.course;
    if (course.requirements) {
      const beforeSemester = this.planned.filter((plannedCourse: ICourse) =>
        plannedCourse.period < course.period &&
        plannedCourse.year === course.year || plannedCourse.year < course.year);
      this.messages = course.requirements.filter((requirement: IRequirement) =>
        !this.requirementService.requirementFilled(requirement, beforeSemester))
          .map((requirement: IRequirement) => this.requirementService.toString(requirement, false));
    } else {
      this.messages = [];
    }
    this.selected = course;
  }

  public cancelCourse(event) {
    this.selected = null;
  }

  public changeStatus(event) {
    this.courseService.changeStatus(event.course, event.status);
  }

  public changeGrade(event) {
    this.courseService.changeGrade(event.course, event.grade);
  }

  public deleteCourse(event) {
    this.courseService.deselectCourseByName(event.course);
  }

  public samplePlan() {
    this.samplePlanService.setCourse();
  }

}
