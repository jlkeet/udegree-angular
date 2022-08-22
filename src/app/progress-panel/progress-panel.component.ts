import {
  Component,
  EventEmitter,
  Output,
  ViewEncapsulation,
} from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import {
  ActivatedRoute,
  NavigationExtras,
  Router,
} from "@angular/router";
import { Store } from "../app.store";
import { ICourse } from "../interfaces";
import {
  CourseStatus
} from "../models";
import {
  DepartmentService,
  FacultyService,
  IRequirement,
  LocationRef,
  ModuleService,
  RequirementService,
  StoreHelper,
} from "../services";
import { DegreeSelection } from "../select-major";
import { FirebaseDbService } from "../core/firebase.db.service";
import { UserContainer } from "../common";
// import { ProgressBarMulti } from "./progress-bar-multi.component";
import { MatDialog, MatDialogConfig } from '@angular/material';
import { ProgressDialogComponent } from "./progress-dialog.component";
import { CoursesPanel } from "../courses-panel";
import { GoogleAnalyticsService } from "../services/google-analytics.service";
import { ProgressPanelService } from "../services/progress-panel.service";


/*
  Component for displaying a group of progress bars
*/

@Component({
  host: {
    style: "flex: 0 0 auto;",
  },
  selector: "progress-panel",
  styleUrls: [require("./progress-panel.component.scss")],
  templateUrl: "./progress-panel.template.html",
  encapsulation: ViewEncapsulation.None,
})
export class ProgressPanel {
  @Output() public onPageChange = new EventEmitter<null>();

  public courses: ICourse[] = [];
  public majorIsSelected: boolean = false;
  public secondMajorIsSelected: boolean = false;
  public thirdMajorIsSelected: boolean = false;
  public requirements: IRequirement[];
  public conjointRequirements: IRequirement[];
  public majorRequirements: IRequirement[];
  public secondMajorRequirements: IRequirement[];
  public thirdMajorRequirements: IRequirement[];
  public pathwayRequirements: IRequirement[];
  public moduleRequirements: IRequirement[];
  public secondModuleRequirements: IRequirement[];
  public gpa;

  public addingModule = false;
  public addedModule = false;
  public addingSecondModule = false;
  public addedSecondModule = false;
  public addingDegree = false;
  public addedDegree = false;
  public addingMajor = false;
  public addedMajor = false;
  public addingPathway = false;
  public addedPathway = false;
  public addingConjoint = false;
  public addedConjoint = false;
  public addingSecondMajor = false;
  public addedSecondMajor = false;
  public addingThirdMajor = false;
  public addedThirdMajor = false;
  public requiresPathway = false;
  

  public faculty;
  public conjoint;
  public majors;
  public majorsList = [];
  public secondMajors;
  public secondMajorsList = [];
  public thirdMajors;
  public thirdMajorsList = [];
  public pathways;
  public pathwaysList = [];
  public modules;
  public faculties;
  public conjoints = [];
  public modulesList;
  public secondModules;
  public secondModulesList;
  public minor: any;
  public subs;
  public currentFaculties;
  public currentConjoints;
  public currentMajors;
  public currentSecondMajors;
  public currentThirdMajors;
  public currentPathways;
  public currentModules;
  public currentSecondModules;

  public firstSemester = null;

  public deleteId;
  public email;

  public collectionList = ["module", "secondModule"];
  public storeList = ["modules", "secondModules"];
  public isDisabled = false;
  public isComplex: boolean;
  
  public fullyPlanned;

  constructor(
    public location: LocationRef,
    public route: ActivatedRoute,
    public router: Router,
    public store: Store,
    public storeHelper: StoreHelper,
    public requirementService: RequirementService,
    public db: AngularFirestore,
    public degreeSelect: DegreeSelection,
    public moduleService: ModuleService,
    public dbCourses: FirebaseDbService,
    public userService: UserContainer,
    public departmentService: DepartmentService,
    public facultyService: FacultyService,
    public dialog: MatDialog,
    public coursesPanel: CoursesPanel,
    public googleAnalyticsService: GoogleAnalyticsService,
    public progressPanelService: ProgressPanelService,
  ) {
    this.currentPathways = degreeSelect.currentPathways;
    this.pathwaysList = degreeSelect.pathways;
    this.currentMajors = degreeSelect.currentMajors;
    this.majorsList = degreeSelect.majors;
    // this.faculties = degreeSelect.faculties;
    this.currentFaculties = degreeSelect.currentFaculties;
    this.conjoints = degreeSelect.conjoints;
    this.currentConjoints = degreeSelect.currentConjoint;
    this.secondMajorsList = degreeSelect.currentSecondMajors;
    this.currentSecondMajors = degreeSelect.currentSecondMajors;
    this.thirdMajorsList = degreeSelect.currentThirdMajors;
    this.currentThirdMajors = degreeSelect.currentThirdMajors;
    this.currentModules = degreeSelect.currentModules;
    this.modulesList = degreeSelect.modules;
    this.currentSecondModules = degreeSelect.currentSecondModules;
    this.secondModulesList = degreeSelect.secondModules;
    // this.isComplex = progressMulti.isComplex
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

      this.store.changes.pluck("thirdMajors").subscribe((thirdMajors) => {
        this.thirdMajors = thirdMajors;
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
  

  public ngOnDestroy() {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  //TESTING: Am only attempting single Major at this time as array not working in degree select.
  // Have commented out the major[0] for now will but will come back for it later.

  public updateRequirementList() {
    this.requirements = [].concat(
      this.faculty
        ? this.majors
          ? this.faculty.majorRequirements
          : this.faculty.majorRequirements
        : []
    );

    this.conjointRequirements = [].concat(
      this.conjoint
        ? this.majors
          ? this.conjoint.majorRequirements
          : this.conjoint.doubleMajorRequirements
        : []
    );

    if (this.conjoint && this.faculty) {
        if (this.faculty.conjointTotal[0].required >= this.conjoint.conjointTotal[0].required) {
          this.conjointRequirements.push(this.faculty.conjointTotal[0])
        } else {
          this.conjointRequirements.push(this.conjoint.conjointTotal[0])
      }
  }


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

   if (this.storeHelper.current('conjoint') && this.secondMajors && this.thirdMajors) {

     if (this.storeHelper.current('conjoint') !== undefined) {
      this.thirdMajorRequirements = [].concat(
      this.thirdMajors.conjointRequirements
    );
     }

  }

    // this.thirdMajorRequirements = [].concat(
    //   this.thirdMajors ? this.thirdMajors.requirements : []
    // );

    //  .concat(this.minor ? this.minor.requirements : []);

    this.moduleRequirements = [].concat(
      this.modules ? this.modules.requirements : []
    );

    this.secondModuleRequirements = [].concat(
      this.secondModules ? this.secondModules.requirements : []
    );

    this.progressPanelService.setReqs(this.requirements)
    this.progressPanelService.setMajReqs(this.majorRequirements)

  }

  public navigateToSelectMajor() {
    const navigationExtras: NavigationExtras = {
      fragment: this.location.location.hash.toString(),
    };

    this.router.navigate(["/major"], navigationExtras);
  }

  public isAlreadySelected(
    alreadyCounted: ICourse[],
    course: ICourse
  ): boolean {
    // check to see if same subject already selected
    const found = alreadyCounted.find(
      (c: ICourse) => c.name.indexOf(course.name.substr(0, 4)) !== -1
    );

    return found !== undefined;
  }

  public deleteDegree() {
    this.email = this.degreeSelect.email;

    let collectionList = [
      "degree",
      "conjoint",
      "major",
      "pathway",
      "secondMajor",
      "thirdMajor",
      "module",
      "secondModule",
    ];
    let storeList = [
      "faculty",
      "conjoint",
      "majors",
      "pathways",
      "secondMajors",
      "thirdMajors",
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
    this.addingDegree = false;
    this.addedDegree = false;
    this.addingMajor = false;
    this.addedMajor = false;
    this.currentFaculties[0] = null;
    this.currentMajors[0] = null;
  }

  public deleteMajor() {
    this.email = this.degreeSelect.email;

    let collectionList = [
      "degree",
      "conjoint",
      "major",
      "pathway",
      "secondMajor",
      "thirdMajor",

    ];
    let storeList = [
      "faculty",
      "conjoint",
      "majors",
      "pathways",
      "secondMajors",
      "thirdMajors",
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
    this.addingMajor = false;
    this.addedMajor = false;
    this.currentMajors[0] = null;
  }

  public deletePathway() {
    this.email = this.degreeSelect.email;

    let collectionList = [
      "pathway",
    ];
    let storeList = [
      "pathways",
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
    this.addingPathway = false;
    this.addedPathway = false;
    this.currentPathways[0] = null;
    this.deleteMajor();
  }

  public deleteConjoint() {
    this.email = this.degreeSelect.email;

    let collectionList = [
      "conjoint",
    ];
    let storeList = [
      "conjoint",
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
    this.addingConjoint = false;
    this.addedConjoint = false;
    this.currentConjoints[0] = null;
    this.deleteSecondMajor();
    this.deleteThirdMajor();
  }


  public deleteSecondMajor() {
    this.email = this.degreeSelect.email;

    let collectionList = [
      "secondMajor",
    ];
    let storeList = [
      "secondMajors",
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
    this.addingSecondMajor = false;
    this.addedSecondMajor = false;
    this.currentSecondMajors[0] = null;
  }

  public deleteThirdMajor() {
    this.email = this.degreeSelect.email;

    let collectionList = [
      "thirdMajor",
    ];
    let storeList = [
      "thirdMajors",
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
    this.addingThirdMajor = false;
    this.addedThirdMajor = false;
    this.currentThirdMajors[0] = null;
  }

  public deleteModule() {
    this.email = this.degreeSelect.email;

    let collectionList = [
      "module",
    ];
    let storeList = [
      "modules",
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
    this.addingModule = false;
    this.addedModule = false;
    this.currentModules[0] = null;
    this.degreeSelect.getFilteredModules();
  }

  public deleteSecondModule() {
    this.email = this.degreeSelect.email;

    let collectionList = [
      "secondModule",
    ];
    let storeList = [
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
    this.addingSecondModule = false;
    this.addedSecondModule = false;
    this.currentSecondModules[0] = null;
   this.degreeSelect.getFilteredSecondModules();
  }

  public yearAndPeriod(): any {
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

  public selectRequirements(requirement: IRequirement): void {

    const stages = requirement.stage
      ? [requirement.stage]
      : requirement.aboveStage
      ? [...Array(4 - requirement.aboveStage).keys()]
          .map((n) => n + 1 + requirement.aboveStage)
          .toString()
      : null;
    let newSem = this.storeHelper.current("semesters")
    let semester = newSem[newSem.length-1]
    if (semester === undefined) {
      this.coursesPanel.newSemester()
      newSem = this.storeHelper.current("semesters")
      semester = newSem[newSem.length-1]
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
      general:
        requirement.flags && requirement.flags.includes("General")
          ? true
          : null,
      // further:
      //   requirement.flags && requirement.flags.includes("further")
      //     ? true
      //       : null,
      
      period: semester.period,
      searchTerm: this.orNull(
        requirement.papers ? requirement.papers.toString() : null
      ),
      stage: stages,
      year: semester.year,
    };

    
    if (requirement.complex !== undefined) {
  } else {
  //  console.log(queryParams)
    this.router.navigate(["/add"], { queryParams });
  }
}

  public orNull(arg) {
    if (arg) {
      return arg;
    } else {
      return null;
    }
  }

  public changeFaculty(which, event) {
    this.degreeSelect.changeFaculty(which, event);
  }

  public changeMajor(which, event) {
    this.degreeSelect.changeMajor(which, event);
  }

  public changePathway(which, event) {
    this.degreeSelect.changePathway(which, event);
  }

  public changeConjoint(which, event) {
    this.degreeSelect.changeConjoint(which, event);
  }

  public changeSecondMajor(which, event) {
    this.degreeSelect.changeSecondMajor(which, event);
  }

  public changeThirdMajor(which, event) {
    this.degreeSelect.changeThirdMajor(which, event);
  }

  public changeModule(which, event) {
    this.degreeSelect.changeModule(which, event);
  }

  public changeSecondModule(which, event) {
    this.degreeSelect.changeSecondModule(which, event);
  }

  public calculateGPA() {
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
  
  public pathwayCheck(value) {

    for (let i = 0; i < this.degreeSelect.pathways.length; i++) {
      if (this.degreeSelect.pathways[0][i].value.faculties.includes(value.name)) {
        this.requiresPathway = true;
        this.addedMajor = false;
      }
    }
  }

  public pathwayClicked(value) {
    this.addingPathway = true;
  }

  public moduleClicked() {
   this.addingModule = true;
    this.modulesList = this.degreeSelect.modules;
    for (let i = this.modulesList[0].length - 1; i > 0; i--) {
      if (!this.modulesList[0][i].value.faculties.includes(this.faculty.name)) {
        this.modulesList.splice([i], 1);
      }
      if (
        this.modulesList[0][i].value.name === this.modules.name ||
        this.modulesList[0][i].value.name === this.secondModules.name
      ) {
        this.modulesList.splice([i], 2);
      }
    }
  }

  public secondModuleClicked() {
    this.addingSecondModule = true;
     this.secondModulesList = this.degreeSelect.secondModules;
     for (let i = this.secondModulesList[0].length - 1; i > 0; i--) {
       if (!this.secondModulesList[0][i].value.faculties.includes(this.faculty.name)) {
         this.secondModulesList.splice([i], 1);
       }
       if (
         this.secondModulesList[0][i].value.name === this.modules.name ||
         this.secondModulesList[0][i].value.name === this.secondModules.name
       ) {
         this.secondModulesList.splice([i], 2);
       }
     }
   }

  public pathwayFilter() {
    for (let i = this.degreeSelect.pathways.length[0] - 1; i >= 0; i--) {
      if (!this.degreeSelect.pathways[0][i].value.faculties.includes(this.currentMajors[0].name)) 
      {
      this.degreeSelect.pathways[0].splice([i], 1);

      }
    }
  }

  public expansionOnClick() {
    this.isDisabled = false;
    return this.isDisabled;
  }

  public noExpansionOnClick() {
    this.isDisabled = true;
    return this.isDisabled;
  }

  public openDialog(degSelectId) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    dialogConfig.data = {
      id: degSelectId,
  };
  
    const dialogRef = this.dialog.open(ProgressDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
        data => console.log("Dialog output:", data)
    );    
}

newDegreeEvent(){ 
  this
  .googleAnalyticsService
  .eventEmitter("add_deg", "progress-panel", "degree", "click", 10);
} 

newMajorEvent(){ 
  this
  .googleAnalyticsService
  .eventEmitter("add_maj", "progress-panel", "major", "click", 10);
} 

newConjointEvent(){ 
  this
  .googleAnalyticsService
  .eventEmitter("add_con", "progress-panel", "conjoint", "click", 10);
} 

newSecondMajorEvent(){ 
  this
  .googleAnalyticsService
  .eventEmitter("add_secondMaj", "progress-panel", "second_major", "click", 10);
} 



newPGDegreeEvent(){ 
  this
  .googleAnalyticsService
  .eventEmitter("pg_deg", "progress-panel", "degree", "click", 10);
} 


newPGMajorEvent(){ 
  this
  .googleAnalyticsService
  .eventEmitter("pg_majpr", "progress-panel", "major", "click", 10);
} 


newPGSecondMajorEvent(){ 
  this
  .googleAnalyticsService
  .eventEmitter("pg_secondMaj", "progress-panel", "secondMajor", "click", 10);
} 


newPGConjointEvent(){ 
  this
  .googleAnalyticsService
  .eventEmitter("pg_conjoint", "progress-panel", "conjoint", "click", 10);
}

}
