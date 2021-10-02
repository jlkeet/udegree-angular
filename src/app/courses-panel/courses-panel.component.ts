import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChange
} from '@angular/core';
import 'rxjs/Rx';
import { Store } from '../app.store';
import { ICourse } from '../interfaces';
import {
  CourseModel,
  CourseStatus,
  Message,
  MessageStatus,
  Period,
  SemesterModel
} from '../models';
import {
  ClickedEvent,
  CourseEventService,
  CourseService,
  MovedEvent,
  RemovedEvent,
  StoreHelper
} from '../services';

/*
  Component for displaying a list of courses organised by year and semester
*/
@Component({
  host: {
    style: 'flex: 3 0 auto;'
  },
  selector: 'courses-panel',
  styles: [require('./courses-panel.component.scss')],
  templateUrl: './courses-panel.template.html'
})
export class CoursesPanel {
  @Output() public courseMoved: EventEmitter<MovedEvent>;
  @Output() public courseRemoved: EventEmitter<RemovedEvent>;
  @Output() public courseClicked: EventEmitter<ClickedEvent>;
  @Input() public courses: ICourse[] = [];

  private messages: Message[];
  private semesters = [];
  private filteredCourses;
  private newOpen;

  private selectedYear;
  private selectedPeriod;
  private addingSemester = false;

  constructor(
    private coursesService: CourseService,
    private courseEventService: CourseEventService,
    private store: Store,
    private storeHelper: StoreHelper
  ) {
    this.courseMoved = new EventEmitter<MovedEvent>();
    this.courseRemoved = new EventEmitter<RemovedEvent>();
    this.courseClicked = new EventEmitter<ClickedEvent>();

    // when the user moves a course, this will fire
    courseEventService.courseMoved.subscribe((event: MovedEvent) => {
      this.courseMoved.emit(event);
    });

    // when the user removes a course, this will fire
    courseEventService.courseRemoved.subscribe((event: RemovedEvent) => {
      this.courseRemoved.emit(event);
    });

    // when the user clicks a course, this will fire
    courseEventService.courseClicked.subscribe((event: ClickedEvent) => {
      this.courseClicked.emit(event);
    });

    // this.semesters = this.storeHelper.current('semesters');
    this.store.changes.pluck('semesters').
      subscribe((semesters: any[]) => this.semesters = semesters);

  }

  public ngOnChanges(): void {
    this.newOpen = false;
    this.selectedYear = 2019;
    this.selectedPeriod = Period.One;

    this.filteredCourses =
    this.semesters.map((semester) => this.filterCourses(semester.year, semester.period));
    console.log(this.filteredCourses);
  }

  private filterCourses(year: number, period: Period) {
    console.log(this.courses);
    return this.courses.filter((course: ICourse) =>
      course.year === year && course.period === period);
  }

  private canAddSemester(semester): boolean {
    return this.semesters.filter((s) => s.year === semester.year && s.period === semester.period).length === 0;
  }

  private newSemester(): void {
    const newSemester = { year: Number(this.selectedYear), period: Number(this.selectedPeriod)};
    if (this.canAddSemester(newSemester)) {
      this.semesters.push(newSemester);
      this.semesters.sort((s1, s2) =>
        (s1.year === s2.year) ? s1.period - s2.period : s1.year - s2.year);
      this.storeHelper.update('semesters', this.semesters);
      this.addingSemester = false;
    }
  }

}
