import {
  Component,
  EventEmitter,
  HostListener,
  Injectable,
  Input,
  Output,
} from "@angular/core";
import { ICourse } from "../interfaces";
import { CourseStatus, Period } from "../models";
import {
  CourseService,
  DepartmentService,
  FacultyService,
  ConjointService,
  PathwayService,
  StatusEvent,
  ModuleService,
  StoreHelper,
} from "../services";

/*
    A component for a displaying the details or adding course
    Should break up custom card part
    Doesn't update course to new value, might cause issues
 */

@Component({
  selector: "course-details",
  styles: [require("./course-details.scss")],
  templateUrl: "./course-details.template.html",
})
@Injectable()
export class CourseDetails {
  @Output() private addClicked = new EventEmitter();
  @Output() private deleteClicked = new EventEmitter();
  @Output() private cancelClicked = new EventEmitter();
  @Output() private changeStatus = new EventEmitter();
  @Output() private changeGrade = new EventEmitter();
  @Input() private course: ICourse;
  @Input() private showSemesterFullMessage: boolean;
  @Input() private showAddCourse: boolean;
  @Input() private messages: string[];
  @Input() private custom: boolean = false;
  @Input() private period: Period;
  @Input() private year: number;

  private prerequisitesRequiredMessage: string = null;
  private alreadyPlannedMessage: string = null;
  private opened = false;
  private courseStatus;
  private courseGrade;

  private departments;
  private departmentOptions;
  private faculties;
  private facultyOptions;
  private conjoints;
  private conjointOptions;
  private pathways;
  private pathwayOptions;
  private modules;
  private moduleOptions;

  private customTitle;
  private customPoints;
  private customCode;
  private customFaculty;
  private customDepartment;

  private statuses = [
    { label: "Planned", value: CourseStatus.Planned },
    { label: "In Progress", value: CourseStatus.Enrolled },
    { label: "Completed", value: CourseStatus.Completed },
    { label: "Failed", value: CourseStatus.Failed },
  ];
  private grades = [
    { label: "A+", value: 9 },
    { label: "A", value: 8 },
    { label: "A-", value: 7 },
    { label: "B+", value: 6 },
    { label: "B", value: 5 },
    { label: "B-", value: 4 },
    { label: "C+", value: 3 },
    { label: "C", value: 2 },
    { label: "C-", value: 1 },
    { label: "D+", value: 0 },
    { label: "D", value: -1 },
    { label: "D-", value: -2 },
    { label: "Fail", value: -3 },
  ];

  constructor(
    private courseService: CourseService,
    private departmentService: DepartmentService,
    private facultyService: FacultyService,
    private conjointService: ConjointService,
    private pathwayService: PathwayService,
    private moduleService: ModuleService,
    private storeHelper: StoreHelper,
  ) {
    this.departments = this.departmentService.getDepartments();
    this.faculties = this.facultyService.getFaculties();
    this.conjoints = this.conjointService.getConjoints();
    this.pathways = this.pathwayService.getPathways();
    this.modules = this.moduleService.getModules();

    this.departmentOptions = this.departments.map((department) => {
      return { label: department.name, value: department.name };
    });

    this.facultyOptions = this.faculties.map((faculty) => {
      return { label: faculty.name, value: faculty.name };
    });

    this.conjointOptions = this.conjoints.map((conjoint) => {
      return { label: conjoint.name, value: conjoint.name };
    });

    this.pathwayOptions = this.pathways.map((pathway) => {
      return { label: pathway.name, value: pathway.name };
    });

    this.moduleOptions = this.modules.map((module) => {
      return { label: module.name, value: module.name };
    });

    console.log(this.courseStatus)
  }

  public addCourse() {
    if (this.custom) {
      if (
        this.year &&
        this.period &&
        this.customCode &&
        this.customTitle &&
        this.customPoints &&
        this.customDepartment &&
        this.customFaculty
      ) {
        this.courseService.addCustom(
          this.year,
          this.period,
          this.customCode,
          this.customTitle,
          Number(this.customPoints),
          Number(this.customCode.replace(/^\D+/g, "")[0]),
          this.customDepartment,
          this.customFaculty,
          this.courseStatus
        );
        this.closeDetails();
      }
    } else {
      this.course.selected = false;
      if (this.courseStatus === CourseStatus.None) {
       // this.courseStatus = CourseStatus.Planned;
      }
      this.addClicked.emit({
        course: this.course,
        status: this.courseStatus,
      });
      this.closeDetails();
    }
  }

  public deleteCourse() {
    this.courseService.deselectCourseByName(this.course.name);
    // this.deleteClicked.emit({
    //   course: this.course,
    // });
  }

  // public newStatus(event) {
  //   this.courseGrade = null;
  //   this.courseStatus = Number(event.value);
  //   if (!this.showAddCourse) {
  //     this.changeStatus.emit({
  //       course: this.course,
  //       status: this.courseStatus,
  //     });
  //   }
  // }

  public newStatus(number) {
    this.courseGrade = null;
    this.courseStatus = number;
    if (!this.showAddCourse) {
      this.changeStatus.emit({
        course: this.course,
        status: this.courseStatus,
      });
    }
  }

  public newGrade(event) {
    this.courseGrade = Number(event.value);
    this.changeGrade.emit({
      course: this.course,
      grade: this.courseGrade,
    });
  }

  public cancel(event) {
    event.stopPropagation();
    // this.course.selected = false;
    this.cancelClicked.emit({
      value: this.course,
    });
  }

  public closeDetails() {
    // this.course.selected = false;
    this.opened = false;
    this.cancelClicked.emit({
      value: this.course,
    });
  }

  public doNothing(event) {
    event.stopPropagation();
  }

  public ngOnInit() {
    if (!this.custom && !this.showAddCourse) {
      this.courseGrade = this.course.grade;
    }

    if (!this.custom) {
      if (this.course.status === undefined) {
       // this.courseStatus = CourseStatus.Planned;
      } else {
        this.courseStatus = this.course.status;
      }
      if (this.course.status === CourseStatus.None) {
        // check to see if we can add this course based on prerequisites - are they already planned?
        const msg = "";
        if (msg) {
          this.showAddCourse = false;
          this.prerequisitesRequiredMessage = msg;
        }
      }
      if (this.showAddCourse) {
        this.alreadyPlannedMessage = this.setAlreadyPlannedMessage();
      }
    }
  }

  /*
   * This seems like a dumb hack
   * Opening the details by clicking registers as a click event outside the box
   * So this uses that to set 'opened'.
   * But this might mess up if we opened the dialog without clicking
   */
  @HostListener("document:click", ["$event"]) private clickedOutside($event) {
    if (this.opened) {
      this.closeDetails();
    } else {
      this.opened = true;
    }
  }

  private alreadyPlanned() {

  for (let i = 0; i < this.storeHelper.current("courses").length; i++) {  
    if (this.storeHelper.current("courses")[i].name === this.course.name) {
      return true
    }
  }
  
}

  private setAlreadyPlannedMessage() {
    if (!this.custom) {

      const year = this.course.year;
      const period = this.course.period;
      switch (this.course.status) {
        case CourseStatus.Planned:
          return `This course is planned in semester ${period}, ${year}`;

        case CourseStatus.Completed:
          return `This course was completed in semester ${period}, ${year}`;

        case CourseStatus.Enrolled:
          return `This course is already enrolled in semester ${period}, ${year}`;
      }
    }
  }
}
