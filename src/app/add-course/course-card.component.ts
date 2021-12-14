import { Component, Injectable, Input } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AddCourseService } from './add-course.service';

@Component({
  selector: 'course-card',
  styles: [require('./course-card.component.scss')],
  template: `
    <div class="course-card-container" (click)="toggleDetails(course)">

      <div class="topline">

        <span class="round" (click)="check($event, course)">
          <input type="checkbox" [attr.checked]="course.checked" id="{{id}}" />
          <label for="id"></label>
        </span>

        <span class="bold name">
          {{course.name}}
        </span>

        <span class="points align-right">
          <div class="margin-auto">
            {{course.points}} points
          </div>
        </span>

      </div>

      <div class="title">
        {{course.title}}
      </div>

      <div class="desc">
        {{course.desc}}
      </div>

      <div *ngIf="course.message" class="planned-message">
        {{course.message}}
      </div>

    </div>
  `,
})

@Injectable()
export class CourseCard {
  @Input() public course;
  @Input() public id;

  constructor(private addCourseService: AddCourseService, private db_courses: AngularFireDatabase,) { }

  private toggleDetails(course) {
    this.addCourseService.raiseDetailsToggled(course);    
  }

  private check(event, course) {
    event.stopPropagation();
    this.addCourseService.raiseCourseToggle(course);
  }
}
