import { Component, EventEmitter, Input, Output } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AuthService } from "../core/auth.service";
import { DepartmentService, FacultyService, ConjointService, StoreHelper } from "../services";

@Component({
  selector: "degree-select",
  styles: [
    `
      .content {
      }

      .title {
        background: white;
        font-family: "Open Sans", sans-serif;
        margin-bottom: 5px;
      }

      .degree-select {
      }
      .form-field {
        display: flex;
        flex-direction: column;
        margin-left: 20px;
        margin-right: 20px;
        font-family: "Open Sans", sans-serif;
      }

      .edit-button {
        cursor: pointer;
        width: 25px;
        height: 25px;
        border-radius: 5px;
        border: 1px solid;
        text-align: center;
        color: #bbf;
        font-size: 24px;
      }

      .right {
        float: right;
        margin-right: 20px;
      }

      .blurb {
        padding-left: 20px;
        padding-right: 20px;
        color: #666;
      }
    `,
  ],
  templateUrl: "./degree-select.template.html",
})
export class DegreeSelection {
  @Output() private onPageChange = new EventEmitter<null>();

  private degreeTypes = [
    { value: "regular", view: "Regular" },
    { value: "conjoint", view: "Conjoint" },
  ];

  private degreeType;
  private faculties = [];
  private conjoints = [];
  private currentFaculties = [];
  private currentConjoint = [];
  private majors = [];
  private secondMajors = [];
  private degree = null;
  private currentMajors = [];
  private currentSecondMajors = [];
  private doubleMajorAllowed;
  public email: string = "";
  public degreeId: string = "";
  public majorId: string = "";
  public secondMajorId: string = "";
  public conjointId: string = "";
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
    private departmentService: DepartmentService
  ) {
    this.authService.afAuth.authState.subscribe(async (auth) => {
      this.email = auth.email;
      this.db
        .collection("users")
        .doc(this.email)
        .collection("degree")
        .get()
        .toPromise()
        .then((isItSaved) => {
          if (isItSaved !== undefined) {
            this.getDegID();
          } else {
          }
        });
        this.db
        .collection("users")
        .doc(this.email)
        .collection("major")
        .get()
        .toPromise()
        .then((isItSaved) => {
          if (isItSaved !== undefined) {
            this.getMajID();
          } else {
          }
        this.db
        .collection("users")
        .doc(this.email)
        .collection("secondMajor")
        .get()
        .toPromise()
        .then((isItSaved) => {
          if (isItSaved !== undefined) {
            this.getSecondMajID();
          } else {
          }
        });
      });  
      this.db
        .collection("users")
        .doc(this.email)
        .collection("conjoint")
        .get()
        .toPromise()
        .then((isItSaved) => {
          if (isItSaved !== undefined) {
            this.getConID();
          } else {
          }
        });

      this.degreeType = storeHelper.current("degreeType");
      if (this.degreeType === undefined) {
        this.degreeType = "regular";
      }

      if (this.currentFaculties === null) {
      } else {
        this.currentFaculties = [storeHelper.current("faculty"), null];
      }

      if (this.currentConjoint === null) {
      } else {
        this.currentConjoint = [storeHelper.current("conjoint"), null];
      }

      if (this.currentMajors === null) {
      } else {
        this.currentMajors = [storeHelper.current("majors"), null];
      }
      if (this.currentSecondMajors === null) {
      } else {
        this.currentSecondMajors = [storeHelper.current("secondMajors"), null];
      }

      this.checkFlags();

      this.faculties = facultyService.getFaculties().map((faculty) => {
        return { value: faculty, view: faculty.name };
      });

      this.majors = departmentService.getDepartments().map((majors) => {
        return { value: majors, view: majors.name };
      });

      this.conjoints = conjointService.getConjoints().map((conjoint) => {
        return { value: conjoint, view: conjoint.name };
      });

      this.secondMajors = departmentService
        .getDepartments()
        .map((secondMajors) => {
          return { value: secondMajors, view: secondMajors.name };
        });

      this.populateMajors();
    });
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

  private populateMajors() {
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
      console.log(this.currentConjoint[0])
      console.log(this.secondMajors)
      this.secondMajors[0] = this.departmentService
        .departmentsInFaculty(this.currentConjoint[0])
        .map((department) => {
          return { value: department, view: department.name };
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
    this.setDegree(this.email, this.currentFaculties[0]);
    this.checkFlags();
    this.populateMajors();
  }

  private changeConjoint(which, event) {
    const conjointNames = this.currentConjoint.map((conjoint) =>
      conjoint ? conjoint.name : null
    );
    //this.changeBlurb(this.currentConjoint[which].blurb);
    this.storeHelper.update("conjoint", this.currentConjoint[0]);
    this.setConjoint(this.email, this.currentConjoint[0]);
    this.checkFlags();
    this.populateMajors();
  }

  private changeMajor(which, event) {
    const majorNames = this.currentMajors.map((major) =>
      major ? major.name : null
    );

    this.changeBlurb(this.currentMajors[which].blurb);
    this.storeHelper.update("majors", this.currentMajors[0]);
    this.setMajor(this.email, this.currentMajors[0]);
  }

  // Testing for second major purposes

  private changeSecondMajor(which, event) {
    const majorNames = this.currentSecondMajors.map((secondMajor) =>
      secondMajor ? secondMajor.name : null
    );
    this.changeBlurb(this.currentSecondMajors[which].blurb);
    this.storeHelper.update("secondMajors", this.currentSecondMajors[0]);
    this.setSecondMajor(this.email, this.currentSecondMajors[0]);
  }

  private changeBlurb(blurb: string) {
    if (blurb) {
      this.blurb = blurb;
    } else {
      this.blurb = this.defaultBlurb;
    }
  }

  // this is repeated in the html, should consolidate
  private changePage() {
    if (
      this.currentMajors[0] &&
      (this.degreeType === "regular" || this.currentSecondMajors[0])
    ) {
      this.onPageChange.emit();
    }
  }

  private setDegree(email, faculty) {
      this.db
      .collection("users")
      .doc(this.email)
      .collection("degree")
      .doc("faculty")
      .set(faculty);
  }

  private setConjoint(email, conjoint) {
    this.db
    .collection("users")
    .doc(this.email)
    .collection("conjoint")
    .doc("secondFaculty")
    .set(conjoint);
}

  private setMajor(email, major) {
    this.db
      .collection("users")
      .doc(this.email)
      .collection("major")
      .doc("firstMajor")
      .set(major);
  }

  private setSecondMajor(email, secondMajor) {
      this.db
      .collection("users")
      .doc(this.email)
      .collection("secondMajor")
      .doc("secondMajor")
      .set(secondMajor);
  }

  // Testing displaying faculty

  private getDegID() {
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
            this.loadDegreeFromDb(element.id);
          });
        }
      });
  }

  private getConID() {
    this.db
      .collection("users")
      .doc(this.email)
      .collection("conjoint")
      .get()
      .toPromise()
      .then((sub) => {
        if (sub.docs.length > 0) {
          // Check to see if documents exist in the courses collection
          sub.forEach((element) => {
            // Loop to get all the ids of the docs
            this.conjointId = element.id;
            this.loadConjointFromDb(element.id);
          });
        }
      });
  }

  private getMajID() {
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
            this.loadMajorFromDb(element.id);
          });
        }
      });
  }

  private getSecondMajID() {
    this.db
      .collection("users")
      .doc(this.email)
      .collection("secondMajor")
      .get()
      .toPromise()
      .then((sub) => {
        if (sub.docs.length > 0) {
          // Check to see if documents exist in the courses collection
          sub.forEach((element) => {
            // Loop to get all the ids of the docs
            this.secondMajorId = element.id;
            this.loadSecondMajorFromDb(element.id);
          });
        }
      });
  }

  private getDegreeFromDb(degId) {
    return new Promise<any>(async (resolve) => {
      this.db
        .collection("users")
        .doc(this.email)
        .collection("degree")
        .doc(degId)
        .get()
        .toPromise()
        .then((resultDegree) => {
          resolve(resultDegree.data());
        });
    });
  }

  private getConjointFromDb(conId) {
    return new Promise<any>(async (resolve) => {
      this.db
        .collection("users")
        .doc(this.email)
        .collection("conjoint")
        .doc(conId)
        .get()
        .toPromise()
        .then((resultDegree) => {
          resolve(resultDegree.data());
        });
    });
  }

  private getMajorFromDb(majId) {
    return new Promise<any>((resolve) => {
      this.db
        .collection("users")
        .doc(this.email)
        .collection("major")
        .doc(majId)
        .get()
        .toPromise()
        .then((resultMajor) => {
          resolve(resultMajor.data());
        });
    });
  }

  private getSecondMajorFromDb(majSecId) {
    return new Promise<any>((resolve) => {
      this.db
        .collection("users")
        .doc(this.email)
        .collection("secondMajor")
        .doc(majSecId)
        .get()
        .toPromise()
        .then((resultMajor) => {
          resolve(resultMajor.data());
        });
    });
  }

  private loadDegreeFromDb(degId) {
    this.getDegreeFromDb(degId).then(async (copy) => {
      Object.assign({
        abbrv: copy[0],
        blurb: copy[1],
        doubleMajorRequirements: copy[2],
        flags: copy[3],
        majorRequirements: copy[4],
        majors: copy[5],
        name: copy[6],
      });
      await this.getDegreeFromDb(degId).then((res) => {
        this.storeHelper.update("faculty", res)
      });
    });
  }

  private loadMajorFromDb(majId) {
    this.getMajorFromDb(majId).then(async (copy) => {
      Object.assign({
        blurb: copy[0],
        conjointRequirements: [1],
        faculties: copy[2],
        name: copy[3],
        requirements: copy[4],
      });
      await this.getMajorFromDb(majId).then((res) => {
        this.storeHelper.update("majors", res)
      });
    });
  }

  private loadConjointFromDb(conId) {
    this.getConjointFromDb(conId).then(async (copy) => {
      Object.assign({
        abbrv: copy[0],
        doubleMajorRequirements: copy[1],
        flags: copy[2],
        majorRequirements: copy[3],
        majors: copy[4],
        name: copy[5],
      });
      await this.getConjointFromDb(conId).then((res) => {
        this.storeHelper.update("conjoint", res)
      });
    });
  }

  private loadSecondMajorFromDb(majSecId) {
    this.getSecondMajorFromDb(majSecId).then(async (copy) => {
      Object.assign({
        blurb: copy[0],
        conjointRequirements: [1],
        faculties: copy[2],
        name: copy[3],
        requirements: copy[4],
      });
      await this.getSecondMajorFromDb(majSecId).then((res) => {
        this.storeHelper.update("secondMajors", res),
          this.onPageChange.emit();
      });
    });
  }
}
