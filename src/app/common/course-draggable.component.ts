import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer
} from '@angular/core';
import { DragulaService } from 'ng2-dragula';
import { ICourse } from '../interfaces';
import { CourseStatus, Period } from '../models';
import { StoreHelper } from '../services';

/*
    A component for a displaying a course that can be dragged.
*/

@Component({
  host: {
    style: 'margin: 5px 2.5px;'
  },
  selector: 'course-draggable',
  styles: [require('./course.component.scss')],
  templateUrl: './course-draggable.template.html'
})
export class CourseDraggable {
  @Output() public addCourseClicked = new EventEmitter();
  @Output() public courseClicked = new EventEmitter();
  @Output() public cancelClicked = new EventEmitter();
  @Output() public deleteCourseClicked = new EventEmitter();

  @Input() public course: ICourse;
  @Input() public year: number;
  @Input() public period: Period;

  private showDelete: boolean = false;
  private backgroundColor: string;
  private displayGrade: string;
  // private isDragging: boolean = false;
  private status: boolean = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer,
    private storeHelper: StoreHelper,
    private dragulaService: DragulaService
  ) {
    /*const self = this;
    dragulaService.drag.subscribe((value) => self.isDragging = true);
    dragulaService.drop.subscribe((value) => self.isDragging = false);
    dragulaService.over.subscribe((value) => self.isDragging = true);
    dragulaService.out.subscribe((value) => self.isDragging = false);*/
  }

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
    this.course.selected = !this.course.selected;

    this.courseClicked.emit({
      value: this.course
    });
  }

  private pressForDel() {
   this.status = !this.status;
   console.log("Firing")
  }

  public ngOnInit() {
    this.setBackgroundColour();
    this.initialiseDrag(this.course.status);
    this.course.help = CourseStatus[this.course.status];
    this.displayGradeConvert()
    
  }

  private setBackgroundColour() {
    switch (this.course.status) {
      case CourseStatus.Completed:
        this.backgroundColor = '#66cc00';
        return;

      case CourseStatus.Enrolled:
        this.backgroundColor = '#f2d600';
        this.displayGrade = null;
        this.course.grade = null;
        return;

      case CourseStatus.Planned:
        this.backgroundColor = '#66bbff';
        this.displayGrade = null;
        this.course.grade = null;
        return;

      case CourseStatus.Failed:
        this.backgroundColor = '#ff8087';
        this.displayGrade = "D";
        this.course.grade = 0;
        return;

      default:
        this.backgroundColor = '#444477';
        return;
    }
  }

  private initialiseDrag(status: CourseStatus) {
    switch (status) {
      default:
        this.setDragStatus(true);
        return;
    }
  }

  private setDragStatus(enableDrag: boolean) {
    this.renderer.setElementClass(
      this.el.nativeElement,
      'no-drag',
      !enableDrag
    );
  }

  private displayGradeConvert() {
    switch (this.course.grade) {
      case 9:
        this.displayGrade = "A+";
        break;
      case 8:
        this.displayGrade = "A";
        break;
      case 7:
        this.displayGrade = "A-";
        break;
      case 6:
        this.displayGrade = "B+";
        break;
      case 5:
        this.displayGrade = "B";
        break;
      case 4:
        this.displayGrade = "B-";
        break;
      case 3:
        this.displayGrade = "C+";
        break;
      case 2:
        this.displayGrade = "C";
        break;
      case 1:
        this.displayGrade = "C-";
        break;
      case 0:
        this.displayGrade = "D";
        break;
    }
    
  }
}
