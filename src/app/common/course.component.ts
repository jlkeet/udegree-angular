import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer,
} from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';
import { ICourse } from '../interfaces';
import { CourseStatus } from '../models';
import { StoreHelper } from '../services';

/*
    A component for a course tile.
*/

@Component({
  host: {
    style: 'margin: 5px 2.5px;'
  },
  selector: 'course',
  templateUrl: './course.template.html',
  styleUrls: ['./course.component.scss'],
})

export class Course {
  @Output() public addCourseClicked = new EventEmitter();
  @Output() public courseClicked = new EventEmitter();
  @Output() public cancelClicked = new EventEmitter();
  @Output() public deleteCourseClicked = new EventEmitter();

  @Input() public course: ICourse;
  // true to enable detais view on click
  @Input() public enableDetails: boolean;
  @Input() public largeCard: boolean = false; // if true, increase card size
  public showDelete: boolean;
  public backgroundColor: string;

  /// PUBLIC METHODS
  constructor(
    public el: ElementRef,
    public renderer: Renderer,
    public storeHelper: StoreHelper,
    public db_courses: AngularFireDatabase,
    public db: AngularFirestore,
  ) {}

  public addCourse() {
    this.addCourseClicked.emit({
      value: this.course
    })

  }

  public cancel(event) {
    this.cancelClicked.emit({
      value: this.course
    });
  }
  public deleteCourse() {
    this.deleteCourseClicked.emit({
      value: this.course
    });
  }
  public toggleDetails() {
    if (!this.enableDetails) {
      return;
    }
    this.course.selected = !this.course.selected;

    this.courseClicked.emit({
      value: this.course
    });
  }

  public ngOnInit() {
    this.course.help = CourseStatus[this.course.status]; // reqd?
  }

}
