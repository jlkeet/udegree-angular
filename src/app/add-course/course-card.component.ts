import { Component, Injectable, Input } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AddCourseService } from './add-course.service';

@Component({
  selector: 'course-card',
  styles: [require('./course-card.component.scss')],
  templateUrl: 'course-card.component.html',
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
