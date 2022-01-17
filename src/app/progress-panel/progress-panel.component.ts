import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChange,
  ViewEncapsulation,
} from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import {
  ActivatedRoute,
  NavigationExtras,
  Params,
  Router,
} from "@angular/router";
import { Store } from "../app.store";
import { ICourse } from "../interfaces";
import {
  CourseModel,
  CourseStatus,
  RequirementType,
  SemesterModel,
} from "../models";
import {
  CourseEventService,
  CourseService,
  IRequirement,
  LocationRef,
  ModuleService,
  RequirementService,
  StoreHelper,
} from "../services";
import { DegreeSelection } from "../select-major";
import { FirebaseDbService } from "../core/firebase.db.service";
import { UserService } from "../core/user.service";
import { UserContainer } from "../common";
import { DebugRenderer2 } from "@angular/core/src/view/services";
import { ValueConverter } from "@angular/compiler/src/render3/view/template";

/*
  Component for displaying a group of progress bars
*/

@Component({
  host: {
    style: "flex: 0 0 auto;",
  },
  selector: "progress-panel",
  styles: [require("./progress-panel.component.scss")],
  templateUrl: "./progress-panel.template.html",
  encapsulation: ViewEncapsulation.None,
})
export class ProgressPanel {
  @Output() private onPageChange = new EventEmitter<null>();

  private courses: ICourse[] = [];
  private majorIsSelected: boolean = false;
  private secondMajorIsSelected: boolean = false;
  private requirements: IRequirement[];
  private conjointRequirements: IRequirement[];
  private majorRequirements: IRequirement[];
  private secondMajorRequirements: IRequirement[];
  private pathwayRequirements: IRequirement[];
  private moduleRequirements: IRequirement[];
  private secondModuleRequirements: IRequirement[];
  private gpa;
  public addingModule = false;
  public addedModule = false;
  public addingSecondModule = false;
  public addedSecondModule = false;

  private faculty;
  private conjoint;
  private majors;
  private majorsList = [];
  private secondMajors;
  private pathways;
  private modules;
  private faculties = []
  private modulesList;
  private secondModules;
  private secondModulesList;
  private minor: any;
  private subs;
  private currentFaculties;
  private currentMajors;
  private currentPathways;
  private currentModules;
  private currentSecondModules;

  private firstSemester = null;

  private deleteId;
  private email;

  private collectionList = ["module", "secondModule"];
  private storeList = ["modules", "secondModules"];
  private isDisabled = false;

  constructor(
    private location: LocationRef,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private storeHelper: StoreHelper,
    private requirementService: RequirementService,
    private db: AngularFirestore,
    private degreeSelect: DegreeSelection,
    private moduleService: ModuleService,
    private dbCourses: FirebaseDbService,
    private userService: UserContainer
  ) {
    this.currentModules = degreeSelect.currentModules;
    this.modulesList = degreeSelect.modules[0];
    this.currentSecondModules = degreeSelect.currentSecondModules;
    this.secondModulesList = degreeSelect.secondModules;
    this.pathways = degreeSelect.pathways;
    this.currentPathways = degreeSelect.currentPathways;
    this.currentMajors = degreeSelect.currentMajors;
    this.faculties = degreeSelect.faculties;
    this.currentFaculties = degreeSelect.currentFaculties;
    this.majorsList = degreeSelect.majors;
  }

  public ngOnInit() {
    this.email = this.userService.email;

    this.subs = [
      this.store.changes.pluck("faculty").subscribe((faculty) => {
        this.faculty = faculty;
        this.updateRequirementList();
      }),

      this.store.changes.pluck("conjoint").subscribe((conjoint) => {
        this.conjoint = conjoint;
        this.updateRequirementList();
      }),

      this.store.changes.pluck("majors").subscribe((majors) => {
        this.majors = majors;
        this.updateRequirementList();
      }),

      this.store.changes.pluck("pathways").subscribe((pathways) => {
        this.pathways = pathways;
        this.updateRequirementList();
      }),

      this.store.changes.pluck("secondMajors").subscribe((secondMajors) => {
        this.secondMajors = secondMajors;
        this.updateRequirementList();
      }),

      this.store.changes.pluck("minor").subscribe((minor) => {
        this.minor = minor;
        this.updateRequirementList();
      }),

      this.store.changes.pluck("courses").subscribe((courses: ICourse[]) => {
        this.courses = courses;
        this.calculateGPA();
      }),

      this.store.changes.pluck("modules").subscribe((modules) => {
        this.modules = modules;
        this.updateRequirementList();
      }),

      this.store.changes.pluck("secondModules").subscribe((secondModules) => {
        this.secondModules = secondModules;
        this.updateRequirementList();
      }),

      this.store.changes.pluck("semesters").subscribe((semesters: any[]) => {
        const allSemesters = semesters;
        if (allSemesters.length > 0) {
          this.firstSemester = allSemesters[0];
        } else {
          this.firstSemester = null;
        }
      }),
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
      .concat(
        this.faculty
          ? this.majors
            ? this.faculty.majorRequirements
            : this.faculty.doubleMajorRequirements
          : []
      );
    this.conjointRequirements = [].concat(
      this.conjoint
        ? this.majors
          ? this.conjoint.majorRequirements
          : this.conjoint.doubleMajorRequirements
        : []
    );

    if (this.conjointRequirements.length > 0) {
      this.requirements = [].concat(
        this.faculty ? this.majors && this.faculty.doubleMajorRequirements : []
      );
    }

    this.majorRequirements = [].concat(
      this.majors ? this.majors.requirements : []
    );

    this.pathwayRequirements = [].concat(
      this.pathways ? this.pathways.requirements : []
    );

    this.secondMajorRequirements = [].concat(
      this.secondMajors ? this.secondMajors.requirements : []
    );
    //  .concat(this.minor ? this.minor.requirements : []);

    this.moduleRequirements = [].concat(
      this.modules ? this.modules.requirements : []
    );

    this.secondModuleRequirements = [].concat(
      this.secondModules ? this.secondModules.requirements : []
    );

    if (
      this.conjointRequirements.length > 0 &&
      this.majors !== undefined &&
      this.secondMajors !== undefined
    ) {
      this.majorRequirements = [
        ...this.majorRequirements,
        this.majors.conjointRequirements[0],
      ];
      this.secondMajorRequirements = [
        ...this.secondMajorRequirements,
        this.secondMajors.conjointRequirements[0],
      ];
    }
  }

  private navigateToSelectMajor() {
    const navigationExtras: NavigationExtras = {
      fragment: this.location.location.hash.toString(),
    };

    this.router.navigate(["/major"], navigationExtras);
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

  private deleteDegree() {
    
    this.email = this.degreeSelect.email;
    
    let collectionList = [
      "degree",
      "conjoint",
      "major",
      "pathway",
      "secondMajor",
      "module",
      "secondModule",
    ];
    let storeList = [
      "faculty",
      "conjoint",
      "majors",
      "pathways",
      "secondMajors",
      "modules",
      "secondModules",
    ];
    for (let i = 0; i < collectionList.length; i++) {
      this.db
        .collection("users")
        .doc(this.email)
        .collection(collectionList[i])
        .get()
        .toPromise()
        .then((sub) => {
          if (sub.docs.length > 0) {
            // Check to see if documents exist in the courses collection
            sub.forEach((element) => {
              // Loop to get all the ids of the docs
              this.deleteId = element.id;
              this.storeHelper.update(storeList[i], null);
              // 
              this.db
                .collection("users")
                .doc(this.email)
                .collection(collectionList[i])
                .doc(this.deleteId)
                .delete();
                
            });
          }
          
        });
    }
  }

  private deleteMajor() {
    
    this.email = this.degreeSelect.email;
    
    let collectionList = [
      "degree",
      "conjoint",
      "major",
      "pathway",
      "secondMajor",
      "module",
      "secondModule",
    ];
    let storeList = [
      "faculty",
      "conjoint",
      "majors",
      "pathways",
      "secondMajors",
      "modules",
      "secondModules",
    ];
    for (let i = 1; i < collectionList.length; i++) {
      this.db
        .collection("users")
        .doc(this.email)
        .collection(collectionList[i])
        .get()
        .toPromise()
        .then((sub) => {
          if (sub.docs.length > 0) {
            // Check to see if documents exist in the courses collection
            sub.forEach((element) => {
              // Loop to get all the ids of the docs
              this.deleteId = element.id;
              this.storeHelper.update(storeList[i], null);
              // 
              this.db
                .collection("users")
                .doc(this.email)
                .collection(collectionList[i])
                .doc(this.deleteId)
                .delete();
                
            });
          }
          
        });
    }
    this.addingModule = false;
    this.addedModule = false
    this.currentMajors[0] = null;
  }

  private yearAndPeriod(): any {
    const period = Number(this.route.snapshot.queryParams.period);
    const year = Number(this.route.snapshot.queryParams.year);
    if (!period) {
      if (this.firstSemester !== null) {
        return {
          period: this.firstSemester.period,
          year: this.firstSemester.year,
        };
      } else {
        return null;
      }
    } else {
      return { period, year };
    }
  }

  private selectRequirements(requirement: IRequirement): void {
    const stages = requirement.stage
      ? [requirement.stage]
      : requirement.aboveStage
      ? [...Array(4 - requirement.aboveStage).keys()]
          .map((n) => n + 1 + requirement.aboveStage)
          .toString()
      : null;
    const semester = this.yearAndPeriod();
    if (semester === null) {
      return;
    }

    const queryParams = {
      departments: requirement.departments
        ? requirement.departments.length !== 0
          ? requirement.departments.toString()
          : null
        : null,
      faculties: requirement.faculties
        ? requirement.faculties.length !== 0
          ? requirement.faculties.toString()
          : null
        : null,
      conjoints: requirement.conjoints
        ? requirement.conjoints.length !== 0
          ? requirement.conjoints.toString()
          : null
        : null,
      pathways: requirement.pathways
        ? requirement.pathways.length !== 0
          ? requirement.pathways.toString()
          : null
        : null,
      modules: requirement.modules
        ? requirement.modules.length !== 0
          ? requirement.modules.toString()
          : null
        : null,
      secondModules: requirement.secondModules
        ? requirement.secondModules.length !== 0
          ? requirement.secondModules.toString()
          : null
        : null,
      // general:
      //   requirement.flags && requirement.flags.includes("general")
      //     ? true
      //     : null,
      period: semester.period,
      searchTerm: this.orNull(
        requirement.papers ? requirement.papers.toString() : null
      ),
      stage: stages,
      year: semester.year,
    };

    this.router.navigate(["/add"], { queryParams });
  }

  private orNull(arg) {
    if (arg) {
      return arg;
    } else {
      return null;
    }
  }

  private changeFaculty(which, event) {
    this.degreeSelect.changeFaculty(which, event);
  }

  private changeMajor(which, event) {
    this.degreeSelect.changeMajor(which, event);
  }

  private changeModule(which, event) {
    this.store.changes.pluck("modules").subscribe((modules) => {
      this.modules = modules;
      this.updateRequirementList();
    });

    const moduleNames = this.degreeSelect.currentModules.map((module) =>
      module ? module.name : null
    );
    this.degreeSelect.changeBlurb(this.currentModules[which].blurb);
    this.storeHelper.update("modules", this.currentModules[0]);
    // this.degreeSelect.setModule(this.email, this.currentModules[0]);

    this.dbCourses.setSelection(
      this.email,
      "modules",
      this.currentModules[0],
      "module"
    );

    this.degreeSelect.populateMajors();
  }

  private changeSecondModule(which, event) {
    this.store.changes.pluck("secondModules").subscribe((secondModules) => {
      this.secondModules = secondModules;
      this.updateRequirementList();
    });

    const secondModuleNames = this.degreeSelect.currentSecondModules.map(
      (secondModule) => (secondModule ? secondModule.name : null)
    );
    // this.degreeSelect.changeBlurb(this.currentSecondModules[which].blurb);
    this.storeHelper.update("secondModules", this.currentSecondModules[0]);
    // this.degreeSelect.setSecondModule(this.email, this.currentSecondModules[0]);

    this.dbCourses.setSelection(
      this.email,
      "secondModule",
      this.currentSecondModules[0],
      "secondModule"
    );

    this.degreeSelect.populateMajors();
  }

  private calculateGPA() {
    const courseGrades = this.courses
      .filter(
        (course: ICourse) =>
          course.status === CourseStatus.Completed &&
          course.grade !== undefined &&
          course.grade !== -42
      )
      .map((course: ICourse) => (course.grade < 0 ? 0 : course.grade));
    const failed = this.courses.filter(
      (course: ICourse) => course.status === CourseStatus.Failed
    ).length;
    this.gpa =
      courseGrades.reduce((gradeTotal, grade) => gradeTotal + grade, 0) /
      (courseGrades.length + failed);
  }

  private degreeClicked() {
    for (let i = this.modulesList.length -1; i >= 0; i--) {
      if (!this.modulesList[i].value.faculties.includes(this.faculty.name)) {
        this.modulesList.splice([i], 1);
      }
      if (
        this.modulesList[i].value.name === this.modules.name ||
        this.modulesList[i].value.name === this.secondModules.name
      ) {
        this.modulesList.splice([i], 2);
      }
    }
  }

  private moduleClicked() {
    for (let i = this.modulesList.length -1; i >= 0; i--) {
      if (!this.modulesList[i].value.faculties.includes(this.faculty.name)) {
        this.modulesList.splice([i], 1);
      }
      if (
        this.modulesList[i].value.name === this.modules.name ||
        this.modulesList[i].value.name === this.secondModules.name
      ) {
        this.modulesList.splice([i], 2);
      }
    }
  }

  private secondModuleClicked() {
    for (let i = this.secondModulesList[0].length -1; i >= 0; i--) {
      if (!this.secondModulesList[0][i].value.faculties.includes(this.faculty.name)) {
        this.secondModulesList[0].splice([i], 1);
      }
      if (
        this.secondModulesList[0][i].value.name === this.modules.name ||
        this.secondModulesList[0][i].value.name === this.secondModules.name
      ) {
        this.secondModulesList[0].splice([i], 2);
      }
    }
  }


  private expansionOnClick() {
    this.isDisabled = false;
    return this.isDisabled;
  }

  private noExpansionOnClick() {
    this.isDisabled = true;
    return this.isDisabled;
  }

}
