import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  Renderer,
  SimpleChange
} from '@angular/core';
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
  styles: [require('./course.component.scss')],
  templateUrl: './course.template.html'
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
  private showDelete: boolean;
  private backgroundColor: string;

  /// PUBLIC METHODS
  constructor(
    private el: ElementRef,
    private renderer: Renderer,
    private storeHelper: StoreHelper
  ) {}

  public addCourse() {
    this.addCourseClicked.emit({
      value: this.course
    });
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
