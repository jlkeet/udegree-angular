import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChange
} from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, NavigationExtras, Params, Router } from '@angular/router';
import { Store } from '../app.store';
import { ICourse } from '../interfaces';
import { CourseModel, CourseStatus, RequirementType, SemesterModel } from '../models';
import {
  CourseEventService,
  CourseService,
  IRequirement,
  LocationRef,
  RequirementService,
  StoreHelper
} from '../services';
import { IBarState } from './progress-bar-multi.component';
import { CoursesPanel } from '../courses-panel';
import { DegreeSelection } from '../select-major';

/*
  Component for displaying a group of progress bars
*/

@Component({
  host: {
    style: 'flex: 0 0 auto;'
  },
  selector: 'progress-panel',
  styles: [require('./progress-panel.component.scss')],
  templateUrl: './progress-panel.template.html'
})
export class ProgressPanel {

  @Output() private onPageChange = new EventEmitter<null>();

  private courses: ICourse[] = [];
  private majorIsSelected: boolean = false;
  private requirements: IRequirement[];
  private majorRequirements: IRequirement[];
  private secondMajorRequirements: IRequirement[];
  private gpa;

  private faculty;
  private majors;
  private minor: any;
  private subs;

  private firstSemester = null;

  private degreeId;
  private majorId;
  private email;

  constructor(
    private location: LocationRef,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private storeHelper: StoreHelper,
    private requirementService: RequirementService,
    private db: AngularFirestore,
    private degreeSelect: DegreeSelection,
  ) {
  }

  public ngOnInit() {

    this.subs = [
    this.store.changes.pluck('faculty')
      .subscribe((faculty) => {
        this.faculty = faculty;
        console.log(this.faculty)
        this.updateRequirementList();
      }),

    this.store.changes.pluck('majors')
      .subscribe((majors: any[]) => {
        this.majors = majors;
        console.log(this.majors)
        this.updateRequirementList();
      }),

    this.store.changes.pluck('minor')
      .subscribe((minor) => {
        this.minor = minor;
        this.updateRequirementList();
      }),

      this.store.changes.pluck('courses')
      .subscribe((courses: ICourse[]) => {
        this.courses = courses;
        this.calculateGPA();
      }),
      this.store.changes.pluck('semesters')
      .subscribe((semesters: any[]) => {
        const allSemesters = semesters;
        if (allSemesters.length > 0) {
          this.firstSemester = allSemesters[0];
        } else {
          this.firstSemester = null;
        }
      })
    ];
  }

  public ngOnChanges() {
    this.calculateGPA();
  }

  private ngOnDestroy() {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  //TESTING: Am only attempting single Major at this time as array not working in degree select.
  // Have commented out the major[0] for now will but will come back for it later.

  private updateRequirementList() {
    this.requirements = []
      //.concat(this.faculty ? (this.majors[0] && this.majors[1] ?
        .concat(this.faculty ? (this.majors ?
        this.faculty.doubleMajorRequirements : this.faculty.majorRequirements) : []);
    this.majorRequirements = []
    // .concat(this.majors[0] ? this.majors[0].requirements : []);
      .concat(this.majors ? this.majors.requirements : []);
    this.secondMajorRequirements = []
      .concat(this.majors[1] ? this.majors[1].requirements : []);
    //  .concat(this.minor ? this.minor.requirements : []);
  }

  private navigateToSelectMajor() {
    const navigationExtras: NavigationExtras = {
      fragment: this.location.location.hash.toString()
    };

    this.router.navigate(['/major'], navigationExtras);
  }

  private isAlreadySelected(
    alreadyCounted: ICourse[],
    course: ICourse
  ): boolean {
    // check to see if same subject already selected
    const found = alreadyCounted.find(
      (c: ICourse) => c.name.indexOf(course.name.substr(0, 4)) !== -1
    );

    return found !== undefined;
  }

  private pageChange() {
    console.log("I'm happening in prog")
    this.email = this.degreeSelect.email;
    console.log(this.email, " ", this.degreeId)
    console.log(this.email, " ", this.majorId)

    this.getDegIDforDel();
    this.getMajIDforDel();


    this.onPageChange.emit();
  }

  private yearAndPeriod(): any {
    const period = Number(this.route.snapshot.queryParams.period);
    const year = Number(this.route.snapshot.queryParams.year);
    if (!period) {
      if (this.firstSemester !== null) {
        return {period: this.firstSemester.period, year: this.firstSemester.year};
      } else {
        return null;
      }
    } else {
      return {period, year};
    }
  }

  private selectRequirements(requirement: IRequirement): void {
    const stages =
      requirement.stage ? [requirement.stage] :
      requirement.aboveStage ?
      [...Array(4 - requirement.aboveStage).keys()].map((n) => n + 1 + requirement.aboveStage).toString() : null;
    const semester = this.yearAndPeriod();
    if (semester === null) {
      return;
    }

    const queryParams = {
      departments: requirement.departments ?
      (requirement.departments.length !== 0 ? requirement.departments.toString() : null) : null,
      faculties: requirement.faculties ?
      (requirement.faculties.length !== 0 ?  requirement.faculties.toString() : null) : null,
      general: requirement.flags && requirement.flags.includes('general') ? true : null,
      period: semester.period,
      searchTerm: this.orNull(
        requirement.papers ? requirement.papers.toString() : null),
      stage: stages,
      year: semester.year
    };

    this.router.navigate(['/add'], {queryParams});
  }

  private orNull(arg) {
    if (arg) {
      return arg;
    } else {
      return null;
    }
  }

  private calculateGPA() {
    const courseGrades = this.courses.filter((course: ICourse) =>
      course.status === CourseStatus.Completed && course.grade !== undefined && course.grade !== -42)
    .map((course: ICourse) => course.grade < 0 ? 0 : course.grade);
    const failed = this.courses.filter((course: ICourse) => course.status === CourseStatus.Failed).length;
    this.gpa = courseGrades.reduce((gradeTotal, grade) => gradeTotal + grade, 0) / (courseGrades.length + failed);
    console.log('GPA ' + this.gpa);
  }

  private getDegIDforDel() {
    this.db
      .collection("users")
      .doc(this.email)
      .collection("degree")
      .get()
      .toPromise()
      .then((sub) => {
        if (sub.docs.length > 0) {
          // Check to see if documents exist in the courses collection
          sub.forEach((element) => {
            // Loop to get all the ids of the docs
            this.degreeId = element.id;
            this.db
            .collection("users") 
            .doc(this.email)
            .collection("degree")
            .doc(this.degreeId)
            .delete()
          });
        }
      });
  }

  private getMajIDforDel() {
    this.db
      .collection("users")
      .doc(this.email)
      .collection("major")
      .get()
      .toPromise()
      .then((sub) => {
        if (sub.docs.length > 0) {
          // Check to see if documents exist in the courses collection
          sub.forEach((element) => {
            // Loop to get all the ids of the docs
            this.majorId = element.id;
            this.db
            .collection("users") 
            .doc(this.email)
            .collection("major")
            .doc(this.majorId)
            .delete()
          });
        }
      });
  }

}
