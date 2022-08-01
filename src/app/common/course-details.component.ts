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
  ModuleService,
  StoreHelper,
} from "../services";
import * as confetti from 'canvas-confetti';
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
  @Output() public addClicked = new EventEmitter();
  @Output() public deleteClicked = new EventEmitter();
  @Output() public cancelClicked = new EventEmitter();
  @Output() public changeStatus = new EventEmitter();
  @Output() public changeGrade = new EventEmitter();
  @Input() public course: ICourse;
  @Input() public showSemesterFullMessage: boolean;
  @Input() public showAddCourse: boolean;
  @Input() public messages: string[];
  @Input() public custom: boolean = false;
  @Input() public period: Period;
  @Input() public year: number;

  public prerequisitesRequiredMessage: string = null;
  public alreadyPlannedMessage: string = null;
  public opened = false;
  public courseStatus;
  public courseGrade;

  public departments;
  public departmentOptions;
  public faculties;
  public facultyOptions;
  public conjoints;
  public conjointOptions;
  public pathways;
  public pathwayOptions;
  public modules;
  public moduleOptions;

  public customTitle;
  public customPoints;
  public customCode;
  public customFaculty;
  public customDepartment;

  public statuses = [
    { label: "Planned", value: CourseStatus.Planned },
    { label: "In Progress", value: CourseStatus.Enrolled },
    { label: "Completed", value: CourseStatus.Completed },
    { label: "Failed", value: CourseStatus.Failed },
  ];
  public grades = [
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
    public courseService: CourseService,
    public departmentService: DepartmentService,
    public facultyService: FacultyService,
    public conjointService: ConjointService,
    public pathwayService: PathwayService,
    public moduleService: ModuleService,
    public storeHelper: StoreHelper,
  ) {
    // this.departments = this.departmentService.getDepartments();
    // this.faculties = this.facultyService.getFaculties();
    // this.conjoints = this.conjointService.getConjoints();
    // this.pathways = this.pathwayService.getPathways();
    // this.modules = this.moduleService.getModules();

    // this.departmentOptions = this.departments.map((department) => {
    //   return { label: department.name, value: department.name };
    // });

    // this.facultyOptions = this.faculties.map((faculty) => {
    //   return { label: faculty.name, value: faculty.name };
    // });

    // this.conjointOptions = this.conjoints.map((conjoint) => {
    //   return { label: conjoint.name, value: conjoint.name };
    // });

    // this.pathwayOptions = this.pathways.map((pathway) => {
    //   return { label: pathway.name, value: pathway.name };
    // });

    // this.moduleOptions = this.modules.map((module) => {
    //   return { label: module.name, value: module.name };
    // });

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
    let myCanvas = document.createElement('canvas');
    this.courseGrade = null;
    this.courseStatus = number;
    if (!this.showAddCourse) {
      this.changeStatus.emit({
        course: this.course,
        status: this.courseStatus,
      });
    }
    if (this.courseStatus === 2) {
      myCanvas.setAttribute("style", "width: 1500px !important; height: 600px; position: absolute; top: 0px; left: 0px;")
      document.body.appendChild(myCanvas)
      var myConfetti = confetti.create(myCanvas, {
        resize: true,
        useWorker: true
      });
      myConfetti({
        particleCount: 100,
        spread: 160
        // any other options from the global
        // confetti function
      });
      setTimeout( () => {document.body.removeChild(myCanvas)}, 3000)
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
  @HostListener("document:click", ["$event"]) public clickedOutside($event) {
    if (this.opened) {
      this.closeDetails();
    } else {
      this.opened = true;
    }
  }

  public alreadyPlanned() {

  for (let i = 0; i < this.storeHelper.current("courses").length; i++) {  
  if (this.course) {
    if (this.storeHelper.current("courses")[i].name === this.course.name) {
      return true;
      }
    } else {
      return false;
    }
  }
  
}

public async getAllMaps() {

  this.departments = await this.departmentService.getDepartments();
  this.faculties = await this.facultyService.getFaculties();
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

}

  public setAlreadyPlannedMessage() {
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
