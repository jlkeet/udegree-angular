import { Component, ViewEncapsulation } from '@angular/core';
import 'rxjs/Rx';
import { Store } from '../app.store';
import { ICourse } from '../interfaces';
import {
  CourseModel,
  CourseStatus,
  Message,
  SemesterModel
} from '../models';
import {
  ClickedEvent,
  CourseEventService,
  CourseService,
  IRequirement,
  MovedEvent,
  RemovedEvent,
  RequirementService,
  StatusEvent,
  StoreHelper
} from '../services';

import { AppHeader } from '../app.header.component';

/*
  Container for the planning page.
  This container will respond to changes in the store.
 */
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'planner-container-mobile',
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

  `
  ],
  template: `
          <div class='flex flex-col relative fullwidth'>
              <course-details *ngIf='selected' [showAddCourse]='false' [course]='selected'
              (cancelClicked)='cancelCourse($event)'
              (changeStatus)='changeStatus($event)' (changeGrade)='changeGrade($event)'
              [messages]="messages" (deleteClicked)='deleteCourse($event)'
              ></course-details>
              <courses-panel  [courses]='planned' (courseMoved)='handleCourseMoved($event)'
              (courseRemoved)='handleCourseRemoved($event)' (courseClicked)='handleCourseClicked($event)'>
              </courses-panel>
          </div>
  `
})
export class PlannerContainerMobile {
  public planned: ICourse[] = [];
  public messages: string[] | any[] = []; 
  public majorSelected: boolean = false;
  public selected: ICourse = null;
  public sub;
  public isMobile;

  constructor(
    public requirementService: RequirementService,
    public storeHelper: StoreHelper,
    public store: Store,
    public courseService: CourseService,
    public appHeader: AppHeader,
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
    // remove course from semester
    this.courseService.deselectCourse(event.courseId);
  }

  public handleCourseClicked(event: ClickedEvent) {
    // remove course from semester
    const course = event.course;
    if (course.requirements !== undefined) {
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
    this.courseService.deselectCourse(event.course.id);
  }

}
