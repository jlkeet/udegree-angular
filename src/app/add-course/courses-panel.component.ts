import { Component, EventEmitter, Injectable, Input, Output, SimpleChanges } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';
import { ICourse } from '../interfaces';
import { CourseStatus, DepartmentCoursesModel } from '../models';
import { CourseService, StoreHelper } from '../services';
import { CourseCard } from './course-card.component';

@Component({
  selector: 'add-course-panel',
  styles: [require('./courses-panel.component.scss')],
  template: `
    <div
    ngxInfiniteScroller
    (onScrollDown)="onScroll()"
    class="courses-panel" [class.details-overlay]="selected">
      
      <div *ngIf="curScroll.length !== 0">
        <div *ngFor="let department of curScroll; let i = index">

          <div class="department-title">
            {{department.title}}
          </div>
          
          <div *ngFor="let course of department.courses; let i = index" class="inline-block">
            <course-card [course]="mapCourse(course)" [id]="department.title + '_' + i"> </course-card>
          </div>

          <div *ngIf="department.compulsary">
            <h3>
              Compulsary:
            </h3>
            <div *ngFor="let course of department.compulsary; let i = index" class="inline-block">
              <course-card [course]="mapCourse(course)" [id]="department.title + '_comp_' + i"> </course-card>
            </div>
          </div>

          
        </div>
      </div>

      <div *ngIf="curScroll.length === 0">
        <h2>
          No results
        </h2>
      </div>

    </div>
      `
})

@Injectable()
export class AddCoursePanel {
  @Input() public departmentCourses;

  @Output() public addCourseClicked = new EventEmitter();
  @Output() public cancelClicked = new EventEmitter();

  private courseStatus;
  private curScroll;
  private scrollTo;
  

  constructor(private courseService: CourseService, private storeHelper: StoreHelper, private db_courses: AngularFireDatabase, private db: AngularFirestore) { }

  ngOnChanges(changes: SimpleChanges){
    this.scrollTo = 2;
    this.curScroll = this.departmentCourses.slice(0, this.scrollTo);
  }

  // should change to appending to curScroll
  private onScroll() {
    this.scrollTo = Math.min(this.scrollTo + 2, this.departmentCourses.length);
    this.curScroll = this.departmentCourses.slice(0, this.scrollTo);
  }

  private mapCourse(course: ICourse) {
    const mappedCourse = {
      checked: null,
      desc: course.desc,
      id: course.id,
      message: null,
      name: course.name,
      points: course.points,
      requirements: course.requirements,
      title: course.title,
    };
    const plannedCourse = this.courseService.findPlanned(course.name);
    if (plannedCourse !== undefined) {
      mappedCourse.checked = 'checked'; // to use the html element, you need to specify checked instead of a boolean
      mappedCourse.message = 'Course planned in ' + plannedCourse.year + ', Semester ' + plannedCourse.period;
    }
    return mappedCourse;
  }
}
