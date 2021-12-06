import { Component } from '@angular/core';
import {
  ActivatedRoute,
  NavigationExtras,
  Router
} from '@angular/router';
import {
  AddCourseService,
} from '../add-course';
import { Store } from '../app.store';
import { ICourse } from '../interfaces';
import {
  CourseModel,
  CourseStatus,
  DepartmentCoursesModel,
  Message,
  Period,
  SemesterModel
} from '../models';
import {
  CourseEventService,
  CourseService,
  IRequirement,
  ModuleService,
  MovedEvent,
  RemovedEvent,
  RequirementService,
  StoreHelper
} from '../services';

/*
  Container for addding a course to a semester.
  TODO:: Split this up!
 */

@Component({
  selector: 'add-course-container',
  styles: [require('./add-course-container.scss')],
  templateUrl: './add-course-container.template.html'
})

export class AddCourseContainer {
  private majorSelected: boolean;
  private semesterText: string;
  private semesterCourses: ICourse[];
  private lastSelection: number = null;
  private selected: ICourse = null;
  private searchTerm: string = '';
  private planned: ICourse[] = [];
  private beforeSemester: ICourse[];
  private currentSemester: ICourse[];
  private shown: ICourse[] = [];
  private filterParams;
  private modules;

  // list of departments and their courses for a faculty
  private departmentCourses: DepartmentCoursesModel[];
  private messages: Message[] = [];
  private browseTitle: string = '';
  private showSemesterFullMessage: boolean = false;

  private period: Period;
  private year: number;
  private allCourses;
  private semesters;
  private facultyChoices;
  private departmentChoices;
  private subscriptions = [];

  private custom;

  constructor(
    private addCourseService: AddCourseService,
    private moduleService: ModuleService,
    private storeHelper: StoreHelper,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private coursesService: CourseService,
    private courseEventService: CourseEventService,
    private requirementService: RequirementService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.period = Number(this.route.snapshot.queryParams.period);
    this.year = Number(this.route.snapshot.queryParams.year);
    const defaultFaculties = [this.storeHelper.current('faculty')];
    let facultyFilter = this.mapToArray(this.route.snapshot.queryParams.faculties);
    facultyFilter = facultyFilter.length !== 0 ? facultyFilter :
      (defaultFaculties[0] ? defaultFaculties.map((faculty) => faculty.name) : []);
    this.filterParams = {
      departments: this.mapToArray(this.route.snapshot.queryParams.departments),
      faculties: facultyFilter,
      general: this.orNull(this.route.snapshot.queryParams.general),
      corequesite: this.orNull(this.route.snapshot.queryParams.corequesite),
      hidePlanned: this.orNull(this.route.snapshot.queryParams.hidePlanned),
      ineligible: this.orNull(this.route.snapshot.queryParams.ineligible),
      searchTerm: this.orNull(this.route.snapshot.queryParams.searchTerm),
      stage: this.mapToArray(this.route.snapshot.queryParams.stage).map((n) => Number(n))
    };
    this.semesters = this.storeHelper.current('semesters');
    this.reset();
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  // sidebarfilter changed
  public filterChanged(event) {
    this.shown = event.shown;

    if (event.modules) {
      this.departmentCourses = this.mapToModuleModel(this.shown);
    } else {
      this.departmentCourses = this.mapToDeptModel(
        this.groupByDepartment(this.shown)
      );
    }
    /*if (event.noUpdate !== true) {
       this.router.navigate(['/add'], {queryParams});
    }*/
    this.updateView();
  }

  private intersection<T>(array1: T[], array2: T[]): T[] {
    if (array1 && array2) {
      return array1.filter((str: T) => array2.includes(str));
    } else {
      return [];
    }
  }


  private mapToModuleModel(shown: ICourse[]): any[] {
    return this.modules.map((mod) => {
      return {
        title: mod.name,
        courses: this.intersection(mod.courses, shown),
        compulsary: this.nullIfEmpty(this.intersection(mod.compulsary, shown))
      }}).filter((mod) => mod.courses.length !== 0);
  }

  private nullIfEmpty(array: any[]) {
    return array.length === 0 ? null : array;
  }

  public cancel() {
    if (this.lastSelection !== null) {
      this.coursesService.deselectCourse(this.lastSelection);
    }
    this.router.navigate(['/planner']);
  }

  public cancelCourse() {
    this.selected = null;
    this.custom = false;
  }

  public toggleCourse(courseToToggle: ICourse) {
    const alreadyPlanned = this.coursesService.findPlanned(courseToToggle.name);
    if (alreadyPlanned) {
      // this doesn't make sense if there's multiple of one course
      this.coursesService.deselectCourseByName(courseToToggle.name);
    } else {
      this.coursesService.selectCourse(courseToToggle.id, this.period, this.year);
    }
  }

  public addCourse(event) {
    this.coursesService.selectCourse(event.course.id, this.period, this.year, event.status);
    this.selected = null;
  }

  public deleteCourse(event) {
    this.coursesService.deselectCourse(event.course);
  }

  public courseSelected(event) {
    this.selected = event.value;
  }

  private reset(): void {

    this.semesterText = `${this.year} ${this.getSemesterNameInWords(this.period)}`;
    this.sameTime = this.sameTime.bind(this);

    this.allCourses = this.coursesService.getAllCourses()
    .filter((course: ICourse) =>
      course.periods ? course.periods.includes(this.period) : true);
      this.allCourses = this.allCourses.filter((course: ICourse) => 
      course.isActive !== false // Remove inactive courses from the course selection
    );    
    this.shown = this.allCourses;
    this.modules = this.moduleService.getModules();
    this.departmentCourses = this.mapToDeptModel(
      this.groupByDepartment(this.shown)
    );

    this.subscriptions.forEach((subscription) => subscription.unsubscribe());

    // the id of the semester to add the course to

    this.subscriptions = [
      this.addCourseService.courseToggled.subscribe((course: ICourse) => this.toggleCourse(course)),
      this.addCourseService.detailsToggled.subscribe((course: ICourse) => this.selected = course),
      this.store.changes.pluck('courses')
      .subscribe((courses: ICourse[]) => {
        this.planned = courses;
        this.beforeSemester = this.planned.filter((course: ICourse) =>
          course.period < this.period && course.year === this.year ||
          course.year < this.year
        );
        this.currentSemester = this.planned.filter((course: ICourse) =>
          course.period === this.period && course.year === this.year
        );
      // console.log("before: ", this.beforeSemester);
      // console.log("current: ", this.currentSemester);
        this.updateView();
      }),
      this.store.changes.pluck('messages').subscribe((messages: Message[]) => { this.messages = messages; }),
      this.courseEventService.courseRemoved
      .subscribe((event) => this.coursesService.deselectCourse(event.courseId)),
    ];
  }

  private sameTime(course: ICourse): boolean {
    return course.period === this.period && course.year === this.year;
  }

  private updateView() {
    this.semesterCourses = this.cloneArray(this.planned.filter(this.sameTime));
    this.showSemesterFullMessage = this.semesterCourses.length >= 6;
    this.flagIneligible();
  }

  private checkRequirements(course: ICourse): string[] {
    console.log("I'm firing -1 ", this.currentSemester.length)
    if (course && course.requirements !== undefined) {
      if (this.currentSemester.length > 0) {
        console.log("I'm firing ", this.currentSemester.length)
        return course.requirements.filter((requirement: IRequirement) =>
        !this.requirementService.requirementFilled(requirement, this.currentSemester))
          .map((requirement: IRequirement) => this.requirementService.toString(requirement, false));
      } else {
        console.log("I'm firing 2 ", this.currentSemester.length)
      return course.requirements.filter((requirement: IRequirement) =>
        !this.requirementService.requirementFilled(requirement, this.beforeSemester))
          .map((requirement: IRequirement) => this.requirementService.toString(requirement, false));
      }
    } else {
      return [];
    }
  }

  private coursePlanned(courseToCheck: ICourse): boolean {
    return this.planned.map((course: ICourse) => course.id).includes(courseToCheck.id);
  }

  private removeInactive(course): void {
        if (course.isActive !== undefined) {
          if (course.isActive !== false) {
          course.canAdd = true;
          } else {
            course.canAdd = false;
          }
        }
  }

  private flagIneligible(): void {
    this.allCourses.forEach(
      (course: ICourse) => {
        if (course.requirements !== undefined && course.requirements !== null) {
          // To find which courses are ineligible, flag all courses that have at least one unfilled requirement
          course.canAdd = course.requirements.filter((requirement: IRequirement) =>
            !this.requirementService.requirementFilled(requirement, this.beforeSemester)
          ).length === 0;
        } else {
          course.canAdd = true;
        }
        //this.removeInactive(course)
      });
  }

  private groupByDepartment(courses: ICourse[]) {
    const grouped = courses.reduce((groups, course) => {
      const key = course.department;
      (groups[key] = groups[key] || []).push(course);
      return groups;
    }, {});
    return grouped;
  }

  private mapToDeptModel(grouped: any) {
    const departmentCourses: DepartmentCoursesModel[] = [];
    for (const property in grouped) {
      if (grouped.hasOwnProperty(property)) {
        const department = departmentCourses.find(
          (dept: DepartmentCoursesModel) => dept.department === property);
        if (department === undefined) {
          departmentCourses.push(
            new DepartmentCoursesModel(
              null,
              property,
              property,
              grouped[property]
            )
          );
        } else {
          department.courses.push(grouped[property]);
        }
      }
    }
    return departmentCourses;
  }

  private getSemesterNameInWords(period: Period) {
    switch (period) {
      case Period.Summer:
        return 'Summer School';
      case Period.One:
        return 'Semester One';
      case Period.Two:
        return 'Semester Two';
      default:
        return 'na';
    }
  }

  private cloneArray<T>(originalArray: T[]) {
    return originalArray.map((obj: T) => Object.assign({}, obj));
  }

  private prevSemester(): void {
    const index = this.currentSemesterIndex() - 1;
    if (index >= 0) {
      const queryParams = this.getQueryParams();
      const nextSemester = this.semesters[index];
      queryParams.year = nextSemester.year;
      queryParams.period = nextSemester.period;
      this.router.navigate(['add'], {queryParams});
      this.period = Number(nextSemester.period);
      this.year = Number(nextSemester.year);
      this.semesterText = `${this.year} ${this.getSemesterNameInWords(this.period)}`;
    }
  }

  private currentSemesterIndex(): number {
    for (let i = 0; i < this.semesters.length; i++) {
      if (this.semesters[i].year === this.year && this.semesters[i].period === this.period) {
        return i;
      }
    }
  }

  private addCustom(): void {
    this.custom = true;
    this.selected = null;
  }

  private nextSemester(): void {
    const index = this.currentSemesterIndex() + 1;
    if (index < this.semesters.length) {
      const queryParams = this.getQueryParams();
      const nextSemester = this.semesters[index];
      queryParams.year = nextSemester.year;
      queryParams.period = nextSemester.period;
      this.router.navigate(['add'], {queryParams});
      this.period = Number(nextSemester.period);
      this.year = Number(nextSemester.year);
      this.semesterText = `${this.year} ${this.getSemesterNameInWords(this.period)}`;
    }

  }

  private getQueryParams(): any {
    return {
      departments: this.filterParams.departments.length !== 0 ? this.filterParams.departments.toString() : null,
      faculties: this.filterParams.faculties.length !== 0 ? this.filterParams.faculties.toString() : null,
      general: this.orNull(this.filterParams.general),
      corequesite: this.orNull(this.filterParams.isCorequesite),
      hidePlanned: this.orNull(this.filterParams.hidePlanned),
      ineligible: this.orNull(this.filterParams.ineligible),
      period: this.period,
      searchTerm: this.orNull(this.filterParams.searchTerm),
      stage: this.filterParams.stage.length !== 0 ? this.filterParams.stage.toString() : null,
      year: this.year,
    };
  }

  private orNull(arg): any {
    return arg ? arg : null;
  }

  // maps a string to an array
  private mapToArray(arg): any[] {
    if (!arg) {
      return [];
    } else if (arg.constructor === Array) {
      return arg;
    }
    return arg.split(',');
  }

  private orEmpty(arg): any[] {
    return arg ? arg : [];
  }
}
