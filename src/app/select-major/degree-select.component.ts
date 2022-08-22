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
import { FirebaseDbService } from "../core/firebase.db.service";
import { UserContainer } from "../common";

@Component({
  selector: "degree-select",
  templateUrl: "./degree-select.template.html",
  styleUrls: ["degree-select.component.scss"],
})
export class DegreeSelection {
  @Output() public onPageChange = new EventEmitter<null>();

  public degreeTypes = [
    { value: "regular", view: "Regular" },
    { value: "conjoint", view: "Conjoint" },
  ];

  public degreeType;
  public faculties;
  public conjoints = [];
  public currentFaculties = [];
  public currentConjoint = [];
  public majors;
  public pathways = [];
  public secondMajors;
  public thirdMajors;
  public modules = [];
  public secondModules = [];
  public degree = null;
  public currentMajors = [];
  public currentPathways = [];
  public currentModules = [];
  public currentSecondModules = [];
  public currentSecondMajors = [];
  public currentThirdMajors = [];
  public doubleMajorAllowed;
  public email: string = "";
  public degreeId: string = "";
  public majorId: string = "";
  public secondMajorId: string = "";
  public thirdMajorId: string = "";
  public conjointId: string = "";
  public pathwayId: string = "";
  public moduleId: string = "";
  public secondModuleId: string = "";
  public facultyForEmail: string = "";

  public defaultBlurb =
    "An undergraduate degree (e.g. Bachelor) is the award you recieve once you have completed your course of study. It is where most first-time university students commence their tertiary studies. To obtain your degree you must complete a specified number and combination of units. Most undergraduate degrees can be completed in 3-5 years of full-time study or 6-10 years part-time.";
  public blurb;

  constructor(
    public facultyService: FacultyService,
    public conjointService: ConjointService,
    public storeHelper: StoreHelper,
    public db: AngularFirestore,
    public authService: AuthService,
    public departmentService: DepartmentService,
    public pathwayService: PathwayService,
    public moduleService: ModuleService,
    public dbCourses: FirebaseDbService,
    public userContainer: UserContainer,
  ) {

    this.authService.afAuth.authState.subscribe(async (auth) => { if (auth) {

      this.email = auth.email;
      this.email = userContainer.email
      this.initiateCurrentPlanFromDb();
      setTimeout(() => {
        this.initiateCurrentPlan()
      }, 3000);  
    }
      
    });
  }

  public initiateCurrentPlanFromDb() {
    return new Promise<void>((resolve, reject) => {
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
          .then((isItSaved) => {
            if (isItSaved.size > 0) {
              this.onPageChange.emit() // Loads the progress bars if there is something in the user database
              this.dbCourses.getID(this.email, collectionList[i], storeList[i]);
            } else {
            }
          });
        // this.db
        //   .collection("users")
        //   .doc(this.email)
        //   .collection("modules")
        //   .get()
        //   .toPromise()
        //   .then((isItSaved) => {
        //     if (isItSaved !== undefined) {
        //       this.getModID();
        //     } else {
        //     }
        //   });
        // this.db
        //   .collection("users")
        //   .doc(this.email)
        //   .collection("secondModules")
        //   .get()
        //   .toPromise()
        //   .then((isItSaved) => {
        //     if (isItSaved !== undefined) {
        //       this.getSecondModID();
        //     } else {
        //     }
        //   });
        resolve();
      }
    });
  }

  public initiateCurrentPlan() {
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

    if (this.currentThirdMajors === null) {
    } else {
      this.currentThirdMajors = [
        this.storeHelper.current("thirdMajors"),
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
    

    this.getFilteredLists();
    this.checkFlags();
    this.populateMajors();
  }

  public checkFlags() {
    if (this.currentFaculties[0] !== null) {
      const flags = this.currentFaculties[0].flags;
      this.doubleMajorAllowed = flags.includes("Dbl Mjr");
    }
  }

  // switches between conjoint and regular
  // some degrees can't be double majors or conjoint
  public changeDegree() {
    if (this.degreeType === "regular") {
      this.currentFaculties[0] = null; // Gotta keep this in here for conjoint reasons.
      this.currentConjoint[0] = null;
      this.majors[1] = this.majors[0];
    } else {
      this.currentSecondMajors[0] = null;

      this.currentThirdMajors[0] = null; // Is this necessary?
    }
    this.blurb = "";
  }

  public populateMajors() {
    if (this.currentConjoint[0] === undefined) {
      this.currentConjoint[0] = null;
    }
    if (this.currentFaculties[0] !== null) {
      this.majors = this.departmentService
        .departmentsInFaculty(this.currentFaculties[0])
        .map((department) => {
          return { value: department, view: department.name };
        });
    }

  if (this.currentFaculties[0]) {
    if (this.currentFaculties[0].name === 'Arts' || this.currentFaculties[0].name === 'Science' ) {
      this.secondMajors = this.departmentService
        .departmentsInFaculty(this.currentFaculties[0])
        .map((department) => {
          return { value: department, view: department.name };
        });
    }
  }

    if (this.currentConjoint[0] !== null) {
      this.thirdMajors = this.departmentService
        .departmentsInFaculty(this.currentConjoint[0])
        .map((department) => {
          return { value: department, view: department.name };
        });
    }

    // This might need to change from Arts to a variable

    // if (this.currentSecondMajors[0] !== null) {
    //   this.thirdMajors = this.departmentService
    //     .departmentsInFaculty('Arts')
    //     .map((department) => {
    //       return { value: department, view: department.name };
    //     });
    // }

    // if (this.currentSecondMajors[0] !== null) {
    //   this.thirdMajors = this.departmentService
    //     .getDepartments()
    //     .map((department) => {
    //       return { value: department, view: department.name };
    //     });
    // }

    if (this.currentMajors[0] !== null) {
      this.pathways[0] = this.pathwayService.getPathways().map((path) => {
        return { value: path, view: path.name };
      });
    }

    if (this.currentModules[0][0] !== null) {
        this.getFilteredSecondModules();
      };
    

    // if (this.currentSecondModules[0] !== null) {
    //   this.secondModules[0] = this.moduleService
    //     .getModules()
    //     .map((secondModule) => {
    //       return { value: secondModule, view: secondModule.name };
    //     });
    // }
  }

  public changeFaculty(which, event) {
    const facultyNames = this.currentFaculties.map((faculty) =>
      faculty ? faculty.name : null
    );
   // this.changeBlurb(this.currentFaculties[which].blurb);
    if (this.degreeType === "regular") {
      this.currentMajors = [null, null];
    } else {
      this.currentMajors[which] = null;
    }
    this.storeHelper.update("faculty", event.value);
    this.dbCourses.setSelection(
      this.email,
      "faculty",
      event.value,
      "degree"
    );
    this.facultyForEmail = this.storeHelper.current("faculty");
    this.currentFaculties[0] = event.value;
    this.checkFlags();
    this.populateMajors();
  }

  public changeConjoint(which, event) {
    const conjointNames = this.currentConjoint.map((conjoint) =>
      conjoint ? conjoint.name : null
    );
    this.storeHelper.update("conjoint", event.value);
    this.dbCourses.setSelection(
      this.email,
      "conjoint",
      event.value,
      "conjoint"
    );
    this.currentConjoint[0] = event.value;
    this.checkFlags();
    this.populateMajors();
  }

  public changeMajor(which, event) {
    const majorNames = this.currentMajors.map((major) =>
      major ? major.name : null
    );

   // this.changeBlurb(this.currentMajors[which].blurb);
    this.storeHelper.update("majors", event.value);
    this.dbCourses.setSelection(
      this.email,
      "firstMajor",
      event.value,
      "major"
    );
    this.currentMajors[0] = event.value
    this.checkFlags();
    this.populateMajors();
  }

  public changePathway(which, event) {
    const pathwayNames = this.currentPathways.map((pathway) =>
      pathway ? pathway.name : null
    );

    this.storeHelper.update("pathways", event.value);
    this.dbCourses.setSelection(
      this.email,
      "pathway",
      event.value,
      "pathway"
    );
    this.currentPathways[0] = event.value;
    this.checkFlags();
    this.populateMajors();
  }

  public changeModule(which, event) {
    const moduleNames = this.currentModules.map((module) =>
      module ? module.name : null
    );

    this.storeHelper.update("modules", event.value);
    this.dbCourses.setSelection(
      this.email,
      "modules",
      event.value,
      "module"
    );
    this.currentModules[0] = event.value;
    this.checkFlags();
    this.populateMajors();
  }

  public changeSecondModule(which, event) {
    const secondModuleNames = this.currentSecondModules.map((secondModule) =>
      secondModule ? secondModule.name : null
    );
    this.storeHelper.update("secondModules", event.value);
    this.dbCourses.setSelection(
      this.email,
      "secondModule",
      event.value,
      "secondModule"
    );
    this.currentSecondModules[0] = event.value;
    this.checkFlags();
    this.populateMajors();
  }

  public changeSecondMajor(which, event) {
    const majorNames = this.currentSecondMajors.map((secondMajor) =>
      secondMajor ? secondMajor.name : null
    );
    this.currentSecondMajors[0] = event.value;
   // this.changeBlurb(this.currentSecondMajors[which].blurb);
    this.storeHelper.update("secondMajors", this.currentSecondMajors[0]);
    this.dbCourses.setSelection(
      this.email,
      "secondMajor",
      this.currentSecondMajors[0],
      "secondMajor"
    );
    this.checkFlags();
    this.populateMajors();
  }

  public changeThirdMajor(which, event) {
    const majorNames = this.currentThirdMajors.map((thirdMajor) =>
      thirdMajor ? thirdMajor.name : null
    );
    this.currentThirdMajors[0] = event.value;
   // this.changeBlurb(this.currentSecondMajors[which].blurb);
    this.storeHelper.update("thirdMajors", this.currentThirdMajors[0]);
    this.dbCourses.setSelection(
      this.email,
      "thirdMajor",
      this.currentThirdMajors[0],
      "thirdMajor"
    );
    this.checkFlags();
    this.populateMajors();
  }

  public changeBlurb(blurb: string) {
    if (blurb) {
      this.blurb = blurb;
    } else {
      this.blurb = this.defaultBlurb;
    }
  }

  // this is repeated in the html, should consolidate
  public changePage() {
    this.facultyForEmail = this.storeHelper.current("faculty").name;
    if (
      this.currentMajors[0] &&
      (this.degreeType === "regular" ||
        this.currentSecondMajors[0] ||
        this.currentThirdMajors[0] ||
        this.currentPathways[0])
    ) {
      this.onPageChange.emit();
    }
  }

  public pathwayFilter() {
    for (let i = this.pathways[0].length -1; i >= 0; i--) {
      if (!this.pathways[0][i].value.faculties.includes(this.currentMajors[0].name)) {
        this.pathways[0].splice([i], 1);
      }
    }
  }

  public async getFilteredLists() {
    this.faculties = await this.facultyService.getFaculties()
   this.faculties =  this.faculties.map((faculty) => {
      // console.log(faculty)
      return { value: faculty, view: faculty.name };
    });

  //   this.majors = await this.departmentService.getDepartments()
  //  this.majors = this.majors.map((majors) => {
  //     return { value: majors, view: majors.name };
  //   });

  this.majors.map((majors) => {
     return { value: majors, view: majors.name };
   });

    this.pathways = this.pathwayService.getPathways().map((pathways) => {
      return { value: pathways, view: pathways.name };
    });

    if (this.currentFaculties[0] != null) { 
    this.conjoints = this.conjointService.getConjoints().filter(v => v.name !== this.currentFaculties[0].name).map((conjoint) => {
      return { value: conjoint, view: conjoint.name };
    });
  }
    this.getFilteredModules();
    this.getFilteredSecondModules();

  //   this.modules = this.moduleService.getModules().filter(v => v.name !== this.currentSecondModules[0].name).map((modules) => {
  //     return { value: modules, view: modules.name };
  //   });

  //   if (this.currentFaculties[0].name === "Arts") {
  //     this.modules = this.moduleService.getModules().filter(v => v.faculties[0] !== "Science").map((modules) => {
  //       return { value: modules, view: modules.name };
  //     });
  //   }

  //   this.secondModules = this.moduleService.getModules().filter(v => v.name !== this.currentModules[0].name).map((secondModules) => {
  //     return { value: secondModules, view: secondModules.name };
  //   });

  //   if (this.currentFaculties[0].name === "Arts") {
  //     this.secondModules = this.moduleService.getModules().filter(f => f.faculties[0] !== "Science").map((secondModules) => {
  //       return { value: secondModules, view: secondModules.name };
  //     });
  // }

    this.secondMajors = await this.departmentService.getDepartments()
    this.secondMajors.filter(v => v.name !== this.currentMajors[0].name)
      .map((secondMajors) => {
        return { value: secondMajors, view: secondMajors.name };
      })

  this.thirdMajors = await this.departmentService.getDepartments()
  this.thirdMajors.filter(v => v.name !== this.currentMajors[0].name)
  .map((thirdMajors) => {
    return { value: thirdMajors, view: thirdMajors.name };
  })
}

  public getFilteredConjoints() {
    this.conjoints = this.conjointService.getConjoints().filter(v => v.name !== this.currentFaculties[0].name).map((conjoint) => {
      return { value: conjoint, view: conjoint.name };
  });
  }

  public getFilteredSecondMajors() {
    this.secondMajors = this.departmentService
    .departmentsInFaculty(this.currentFaculties[0]).filter(v => v.name !== this.currentMajors[0].name)
      .map((secondMajors) => {
        return { value: secondMajors, view: secondMajors.name };
      })
    }

    public getFilteredThirdMajors() {
      this.thirdMajors = this.departmentService.getDepartments()
        this.thirdMajors.filter(v => v.name !== this.currentMajors[0].name)
        .map((thirdMajors) => {
          return { value: thirdMajors, view: thirdMajors.name };
        })
      }

    public getFilteredModules() {
      this.modules = this.moduleService.getModules().filter(v => v.name !== this.currentSecondModules[0].name).map((modules) => {
        return { value: modules, view: modules.name };
      });

      if (this.currentFaculties[0] && this.currentFaculties[0].name === "Arts") {
        this.modules = this.moduleService.getModules().filter(v => v.faculties[0] !== "Science").map((modules) => {
          return { value: modules, view: modules.name };
        });
      }

      }

    public getFilteredSecondModules() {
      this.secondModules = this.moduleService.getModules().filter(v => v.name !== this.currentModules[0].name).map((secondModules) => {
        return { value: secondModules, view: secondModules.name };
      });

      if (this.currentFaculties[0] && this.currentFaculties[0].name === "Arts") {
        this.secondModules = this.moduleService.getModules().filter(f => f.faculties[0] !== "Science" && f.name !== this.currentModules[0].name).map((secondModules) => {
          return { value: secondModules, view: secondModules.name };
        });
      }

      if (this.currentFaculties[0] && this.currentFaculties[0].name === "Science") {
        this.secondModules = this.moduleService.getModules().filter(f => f.faculties[0] !== "Arts" && f.name !== this.currentModules[0].name).map((secondModules) => {
          return { value: secondModules, view: secondModules.name };
        });
      }

      }

}
