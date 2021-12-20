import { Component, EventEmitter, Input, Output } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AuthService } from "../core/auth.service";
import {
  DepartmentService,
  FacultyService,
  ConjointService,
  PathwayService,
  StoreHelper,
  ModuleService,
} from "../services";
import { MatFormFieldControl, MatListOption } from "@angular/material";
import { ProgressPanel } from "../progress-panel";
import { FirebaseDbService } from "../core/firebase.db.service";
import { UserContainer } from "../common";

@Component({
  selector: "degree-select",
  templateUrl: "./degree-select.template.html",
  styleUrls: ["degree-select.component.scss"],
})
export class DegreeSelection {
  @Output() private onPageChange = new EventEmitter<null>();

  private degreeTypes = [
    { value: "regular", view: "Regular" },
    { value: "conjoint", view: "Conjoint" },
  ];

  private degreeType;
  private faculties = [];
  public conjoints = [];
  private currentFaculties = [];
  private currentConjoint = [];
  private majors = [];
  public pathways = [];
  private secondMajors = [];
  public modules = [];
  public secondModules = [];
  private degree = null;
  public currentMajors = [];
  public currentPathways = [];
  public currentModules = [];
  public currentSecondModules = [];
  private currentSecondMajors = [];
  private doubleMajorAllowed;
  public email: string = "";
  public degreeId: string = "";
  public majorId: string = "";
  public secondMajorId: string = "";
  public conjointId: string = "";
  public pathwayId: string = "";
  public moduleId: string = "";
  public secondModuleId: string = "";
  public facultyForEmail: string = "";

  private defaultBlurb =
    "An undergraduate degree (e.g. Bachelor) is the award you recieve once you have completed your course of study. It is where most first-time university students commence their tertiary studies. To obtain your degree you must complete a specified number and combination of units. Most undergraduate degrees can be completed in 3-5 years of full-time study or 6-10 years part-time.";
  private blurb;

  constructor(
    private facultyService: FacultyService,
    private conjointService: ConjointService,
    private storeHelper: StoreHelper,
    private db: AngularFirestore,
    private authService: AuthService,
    private departmentService: DepartmentService,
    private pathwayService: PathwayService,
    private moduleService: ModuleService,
    private dbCourses: FirebaseDbService,
    private userContainer: UserContainer,
  ) {
    this.authService.afAuth.authState.subscribe(async (auth) => {
      this.email = auth.email;
      this.email = userContainer.email
      console.log("Degree sel", this.email)
      this.initiateCurrentPlanFromDb().then(() => {
      this.initiateCurrentPlan()
    }
      )
    });
  }

  private initiateCurrentPlanFromDb() {
    return new Promise<void>((resolve, reject) => {
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
          .then((isItSaved) => {
            if (isItSaved.size > 0) {
              console.log(isItSaved.size)
              this.onPageChange.emit() // Loads the progress bars if there is something in the user database
              this.dbCourses.getID(this.email, collectionList[i], storeList[i]);
            } else {
            }
          });
        this.db
          .collection("users")
          .doc(this.email)
          .collection("modules")
          .get()
          .toPromise()
          .then((isItSaved) => {
            if (isItSaved !== undefined) {
              this.getModID();
            } else {
            }
          });
        this.db
          .collection("users")
          .doc(this.email)
          .collection("secondModules")
          .get()
          .toPromise()
          .then((isItSaved) => {
            if (isItSaved !== undefined) {
              this.getSecondModID();
            } else {
            }
          });
        resolve();
      }
    });
  }

  private initiateCurrentPlan() {
    this.degreeType = this.storeHelper.current("degreeType");

    if (this.degreeType === undefined) {
      this.degreeType = "regular";
    }

    if (this.currentFaculties === null) {
    } else {
      this.currentFaculties = [this.storeHelper.current("faculty"), null];
    }

    if (this.currentConjoint === null) {
    } else {
      this.currentConjoint = [this.storeHelper.current("conjoint"), null];
    }

    if (this.currentMajors === null) {
    } else {
      this.currentMajors = [this.storeHelper.current("majors"), null];
    }
    if (this.currentSecondMajors === null) {
    } else {
      this.currentSecondMajors = [
        this.storeHelper.current("secondMajors"),
        null,
      ];
    }

    if (this.currentPathways === null) {
    } else {
      this.currentPathways = [this.storeHelper.current("pathways"), null];
    }

    if (this.currentModules === null) {
    } else {
      this.currentModules = [this.storeHelper.current("modules"), null];
    }

    if (this.currentSecondModules === null) {
    } else {
      this.currentSecondModules = [
        this.storeHelper.current("secondModules"),
        null,
      ];
    }

    this.faculties = this.facultyService.getFaculties().map((faculty) => {
      return { value: faculty, view: faculty.name };
    });

    this.majors = this.departmentService.getDepartments().map((majors) => {
      return { value: majors, view: majors.name };
    });

    this.pathways = this.pathwayService.getPathways().map((pathways) => {
      return { value: pathways, view: pathways.name };
    });

    this.conjoints = this.conjointService.getConjoints().map((conjoint) => {
      return { value: conjoint, view: conjoint.name };
    });

    // this.modules = this.moduleService.getModules().map((modules) => {
    //   return { value: modules, view: modules.name };
    // });

    // this.secondModules = this.moduleService.getModules().map((secondModules) => {
    //   return { value: secondModules, view: secondModules.name };
    // });

    // this.secondMajors = departmentService
    //   .getDepartments()
    //   .map((secondMajors) => {
    //     return { value: secondMajors, view: secondMajors.name };
    //   })

    this.checkFlags();
    this.populateMajors();
    
  }

  private checkFlags() {
    if (this.currentFaculties[0] !== null) {
      const flags = this.currentFaculties[0].flags;
      this.doubleMajorAllowed = flags.includes("Dbl Mjr");
    }
  }

  // switches between conjoint and regular
  // some degrees can't be double majors or conjoint
  private changeDegree() {
    if (this.degreeType === "regular") {
      this.currentFaculties[0] = null; // Gotta keep this in here for conjoint reasons.
      this.currentConjoint[0] = null;
      this.majors[1] = this.majors[0];
    } else {
      this.currentSecondMajors[0] = null;
    }
    this.blurb = "";
  }

  public populateMajors() {
    if (this.currentConjoint[0] === undefined) {
      this.currentConjoint[0] = null;
    }
    if (this.currentFaculties[0] !== null) {
      this.majors[0] = this.departmentService
        .departmentsInFaculty(this.currentFaculties[0])
        .map((department) => {
          return { value: department, view: department.name };
        });
    }

    if (this.currentConjoint[0] !== null) {
      this.secondMajors[0] = this.departmentService
        .departmentsInFaculty(this.currentConjoint[0])
        .map((department) => {
          return { value: department, view: department.name };
        });
    }

    if (this.currentMajors[0] !== null) {
      this.pathways[0] = this.pathwayService.getPathways().map((path) => {
        return { value: path, view: path.name };
      });
    }

    if (this.currentModules[0] !== null) {
      this.modules[0] = this.moduleService.getModules().map((module) => {
        return { value: module, view: module.name };
      });
    }

    if (this.currentSecondModules[0] !== null) {
      this.secondModules[0] = this.moduleService
        .getModules()
        .map((secondModule) => {
          return { value: secondModule, view: secondModule.name };
        });
    }
  }

  private changeFaculty(which, event) {
    const facultyNames = this.currentFaculties.map((faculty) =>
      faculty ? faculty.name : null
    );
    this.changeBlurb(this.currentFaculties[which].blurb);
    if (this.degreeType === "regular") {
      this.currentMajors = [null, null];
    } else {
      this.currentMajors[which] = null;
    }
    this.storeHelper.update("faculty", this.currentFaculties[0]);
    this.dbCourses.setSelection(
      this.email,
      "faculty",
      this.currentFaculties[0],
      "degree"
    );
    this.facultyForEmail = this.storeHelper.current("faculty");
    this.checkFlags();
    this.populateMajors();
  }

  private changeConjoint(which, event) {
    const conjointNames = this.currentConjoint.map((conjoint) =>
      conjoint ? conjoint.name : null
    );
    this.storeHelper.update("conjoint", this.currentConjoint[0]);
    this.dbCourses.setSelection(
      this.email,
      "conjoint",
      this.currentConjoint[0],
      "conjoint"
    );
    this.checkFlags();
    this.populateMajors();
  }

  private changeMajor(which, event) {
    const majorNames = this.currentMajors.map((major) =>
      major ? major.name : null
    );

    this.changeBlurb(this.currentMajors[which].blurb);
    this.storeHelper.update("majors", this.currentMajors[0]);
    this.dbCourses.setSelection(
      this.email,
      "firstMajor",
      this.currentMajors[0],
      "major"
    );
    this.checkFlags();
    this.populateMajors();
  }

  private changePathway(which, event) {
    const pathwayNames = this.currentPathways.map((pathway) =>
      pathway ? pathway.name : null
    );

    this.changeBlurb(this.currentPathways[which].blurb);
    this.storeHelper.update("pathways", this.currentPathways[0]);
    this.dbCourses.setSelection(
      this.email,
      "pathway",
      this.currentPathways[0],
      "pathway"
    );
  }

  private changeModule(which, event) {
    const moduleNames = this.currentModules.map((module) =>
      module ? module.name : null
    );

    this.changeBlurb(this.currentModules[which].blurb);
    this.storeHelper.update("modules", this.currentModules[0]);
    this.dbCourses.setSelection(
      this.email,
      "modules",
      this.currentModules[0],
      "module"
    );
  }

  private changeSecondModule(which, event) {
    const secondModuleNames = this.currentSecondModules.map((secondModule) =>
      secondModule ? secondModule.name : null
    );
    this.storeHelper.update("secondModules", this.currentSecondModules[0]);
    this.dbCourses.setSelection(
      this.email,
      "secondModule",
      this.currentSecondModules[0],
      "secondModule"
    );
  }

  private changeSecondMajor(which, event) {
    const majorNames = this.currentSecondMajors.map((secondMajor) =>
      secondMajor ? secondMajor.name : null
    );
    this.changeBlurb(this.currentSecondMajors[which].blurb);
    this.storeHelper.update("secondMajors", this.currentSecondMajors[0]);
    this.dbCourses.setSelection(
      this.email,
      "secondMajor",
      this.currentSecondMajors[0],
      "secondMajor"
    );
  }

  public changeBlurb(blurb: string) {
    if (blurb) {
      this.blurb = blurb;
    } else {
      this.blurb = this.defaultBlurb;
    }
  }

  // this is repeated in the html, should consolidate
  private changePage() {
    this.facultyForEmail = this.storeHelper.current("faculty").name;
    if (
      this.currentMajors[0] &&
      (this.degreeType === "regular" ||
        this.currentSecondMajors[0] ||
        this.currentPathways[0])
    ) {
      this.onPageChange.emit();
    }
  }

  public setModule(email, module) {
    this.db
      .collection("users")
      .doc(this.email)
      .collection("module")
      .doc("module")
      .set(module);
  }

  public setSecondModule(email, secondModule) {
    this.db
      .collection("users")
      .doc(this.email)
      .collection("secondModule")
      .doc("secondModule")
      .set(secondModule);
  }

  private getModID() {
    this.db
      .collection("users")
      .doc(this.email)
      .collection("module")
      .get()
      .toPromise()
      .then((sub) => {
        if (sub.docs.length > 0) {
          // Check to see if documents exist in the courses collection
          sub.forEach((element) => {
            // Loop to get all the ids of the docs
            this.moduleId = element.id;
            this.loadModuleFromDb(element.id);
          });
        }
      });
  }

  private getSecondModID() {
    this.db
      .collection("users")
      .doc(this.email)
      .collection("secondModule")
      .get()
      .toPromise()
      .then((sub) => {
        if (sub.docs.length > 0) {
          // Check to see if documents exist in the courses collection
          sub.forEach((element) => {
            // Loop to get all the ids of the docs
            this.secondModuleId = element.id;
            this.loadSecondModuleFromDb(element.id);
          });
        }
      });
  }

  private getModuleFromDb(moduleId) {
    return new Promise<any>((resolve) => {
      this.db
        .collection("users")
        .doc(this.email)
        .collection("module")
        .doc(moduleId)
        .get()
        .toPromise()
        .then((resultModule) => {
          resolve(resultModule.data());
        });
    });
  }

  private getSecondModuleFromDb(secondModuleId) {
    return new Promise<any>((resolve) => {
      this.db
        .collection("users")
        .doc(this.email)
        .collection("secondModule")
        .doc(secondModuleId)
        .get()
        .toPromise()
        .then((resultSecondModule) => {
          resolve(resultSecondModule.data());
        });
    });
  }

  private loadModuleFromDb(moduleId) {
    this.getModuleFromDb(moduleId).then(async (copy) => {
      Object.assign({
        blurb: copy[0],
        courses: copy[1],
        name: copy[2],
        requirements: copy[3],
      });
      this.getModuleFromDb(moduleId).then((res) => {
        this.storeHelper.update("modules", res), this.pageEmitterForDegLoad();
        this.currentModules = [this.storeHelper.current("modules"), null];
      });
    });
  }

  private loadSecondModuleFromDb(secondModuleId) {
    this.getSecondModuleFromDb(secondModuleId).then(async (copy) => {
      Object.assign({
        blurb: copy[0],
        courses: copy[1],
        name: copy[2],
        requirements: copy[3],
      });
      this.getSecondModuleFromDb(secondModuleId).then((res) => {
        this.storeHelper.update("secondModules", res),
          this.pageEmitterForDegLoad();
        this.currentSecondModules = [
          this.storeHelper.current("secondModules"),
          null,
        ];
      });
    });
  }

  public pageEmitterForDegLoad() {
    setTimeout(() => {
      this.onPageChange.emit();
    }, 400);
  }
}
