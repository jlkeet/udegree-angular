import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer,
  // Renderer2
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
  styleUrls: [require('./course.component.scss')],
  templateUrl: './course-draggable.template.html'
})

export class CourseDraggable {
  @Output() public addCourseClicked = new EventEmitter();
  @Output() public courseClicked = new EventEmitter();
  @Output() public cancelClicked = new EventEmitter();
  @Output() public deleteCourseClicked = new EventEmitter();

  @Output() public longClick = new EventEmitter();

  @Input() public course: ICourse;
  @Input() public year: number;
  @Input() public period: Period;

  public showDelete: boolean = false;
  public backgroundColor: string;
  public displayGrade: string;
  // public isDragging: boolean = false;
  public status: boolean = false;
  public group;
  public canDrag;
  public bagName;
  

  constructor(
    public el: ElementRef,
    public renderer: Renderer,
    public storeHelper: StoreHelper,
    public dragulaService: DragulaService
  ) {
    /*const self = this;
    dragulaService.drag.subscribe((value) => self.isDragging = true);
    dragulaService.drop.subscribe((value) => self.isDragging = false);
    dragulaService.over.subscribe((value) => self.isDragging = true);
    dragulaService.out.subscribe((value) => self.isDragging = false);*/



    // let scrollPosition = 0;
    // const body_el = document.getElementById('body');
    // ...or whatever you want to do to get the body element; I gave it an id='body' attribute

    // dragula_obj.on('drag', function (el) { scroll_disable(); });
    // dragula_obj.on('dragend', function (el) { scroll_enable(); }); 
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

  public pressForDel() {

   this.status = !this.status;
   this.canDrag = !this.canDrag

   this.course.dragIt = this.canDrag

   this.longClick.emit({
     value: this.course,
   })

  }

  public ngOnInit() {
    this.setBackgroundColour();
    this.initialiseDrag(this.course.status);
    this.course.help = CourseStatus[this.course.status];
    this.displayGradeConvert()
  }

  public setBackgroundColour() {
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

  public initialiseDrag(status: CourseStatus) {
    switch (status) {
      default:
        this.setDragStatus(true);
        return;
    }
  }

  public setDragStatus(enableDrag: boolean) {
    this.renderer.setElementClass(
      this.el.nativeElement,
      'no-drag',
      !enableDrag
    );
  }

  public displayGradeConvert() {
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
