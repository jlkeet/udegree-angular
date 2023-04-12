// import { formatDate } from "@angular/common";
import { Injectable } from "@angular/core";
// import { Component, Input } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { StoreHelper } from "./store-helper";
import { AuthService } from "../core/auth.service";
import { CourseService } from "./courses";
import { FirebaseDbService } from "../core/firebase.db.service";
import { Period } from "../models";
import { RequirementService } from "./requirement.service";
import { ProgressPanelService } from "./progress-panel.service";

// import { FirebaseDbService } from "../core/firebase.db.service";

@Injectable()
export class SamplePlanService {


    public semesters = [];  
    public selectedYear;
    public selectedPeriod;
    public addingSemester = false;
    public email: string;
    public samplePlan_biosci = [];
    public period = 1
    public year = 2023;

    public majReqs = [];



  constructor(
    public authService: AuthService,
    public db: AngularFirestore,
    public storeHelper: StoreHelper,
    public courseService: CourseService,
    public dbCourseService: FirebaseDbService,
    public progressPanelService: ProgressPanelService
    // public coursesPanel: CoursesPanel,
  ) { 
    this.selectedYear = 2023;
    this.selectedPeriod = Period.One;

    this.samplePlan_biosci.push(377, 378, 379, 380)
   }

  public testing() {
  }

  public setExportStatus(adminStatus, userEmail) {
  }

  public getStatus() {
  }

  public getCourse() {
    return this.courseService.allCourses[377];
  }

  public setCourse() {

    this.getEssentialCourses();
    this.complexCourses();

//    for (let i = 0; i < 24; i++)  {
//     if (this.storeHelper.current("courses").length > 0) { 
//         if (this.storeHelper.current("courses").length % 8 == 0) {
//             this.newYear();
//             }
//         }

//    if (this.storeHelper.current("courses").length > 0) { 
//     if (this.storeHelper.current("courses").length % 4 == 0) {
//         this.periodSwitcheroo();
//         }
//     }
//     this.courseService.setCourseDb(this.courseService.allCourses[this.getRandomCourse(3655)], 315, this.period, this.year)
//     // console.log(this.storeHelper.current('courses'))

//     }
//     this.loadPlanFromDb();
  }

  public loadPlanFromDb() {
    this.yearPeriodChecker();
    this.db
        .collection("users")
        .doc("jackson.keet1989@gmail.com")
        .get()
        .toPromise()
        .then((doc) => {
          if (doc.exists) {
            this.db
              .collection("users")
              .doc("jackson.keet1989@gmail.com")
              .collection("courses")
              .get()
              .toPromise()
              .then((sub) => {
                if (sub.docs.length > 0) {
                  // Check to see if documents exist in the courses collection
                  sub.forEach((element) => {
                    // Loop to get all the ids of the docs
                    this.addSemesterFromDb(element.id);
                    this.loadCourseFromDb(element.id); // Call to loading the courses on the screen, by id
                  });
                
                }
            });
          }
        });
    }

  public loadCourseFromDb(courseDbId) {
    const courseDb = this.getCourseFromDb(courseDbId).then((copy) => {
      Object.assign({
        department: copy[0],
        desc: copy[1],
        faculties: copy[2],
        id: copy[3],
        generatedId: copy[4],
        name: copy[5],
        period: copy[6],
        points: copy[7],
        requirements: copy[8],
        stage: copy[9],
        status: copy[10],
        title: copy[11],
        year: copy[12],
        canDelete: true,

      });
      this.getCourseFromDb(courseDbId).then((res) => {
          this.storeHelper.findAndDelete('courses', res);
          this.storeHelper.add("courses", res);
          this.courseService.updateErrors();
      });
    });
  }

  private getCourseFromDb(courseDbId: string) {
    return new Promise<any>((resolve) => {
      const semesterFromDb = {
        course: 
          this.dbCourseService.getCollection("users", "courses", courseDbId).then( (res) => {resolve((res))} )
      };
    });
  }

  public addSemesterFromDb(courseDbId: string) {
    
    var newSemesterFromDb = { year: Number(), period: Number(), both: String() };

    // The following code is super gumby, because of the promised value not being returned before executing the next lines
    // I put everything into the promise on line 194 by chaining then() functions. It works though.

    this.getSemesterFromDb(courseDbId)
      .then((theYear) => {
        this.selectedYear = theYear;
      })
      .then(
        () => (newSemesterFromDb = { year: this.selectedYear, period: null, both: null })
      ); // Updates the year value withing the newSemesterFromDb variable
    this.getPeriodFromDb(courseDbId)
      .then(
        // This call is the first chained then
        (thePeriod) => (this.selectedPeriod = thePeriod)
      )
      .then(
        () =>
          (newSemesterFromDb = {
            year: this.selectedYear,
            period: this.selectedPeriod,
            both: this.selectedYear + " " + this.selectedPeriod
          }
        )
      )
      .then(() => {
        // Updates the period value withing the newSemesterFromDb variable
        if (this.canAddSemester(newSemesterFromDb)) {
          // Here is the rest of the code to execute within the chained then statements. So that it can occur within the promise
          this.semesters.push(newSemesterFromDb);
          this.semesters.sort((s1, s2) =>
            s1.year === s2.year ? s1.period - s2.period : s1.year - s2.year
          );
         // this.dbCourses.addSelection(this.email, "semester", newSemesterFromDb, "semesters")
          this.storeHelper.update("semesters", this.semesters);
          this.addingSemester = false; // Reverts the semster panel back to neutral
          this.selectedPeriod = Period.One; // Revert to the default value
          this.selectedYear++; // Increment the selected year so that it defaults to the next one, this avoids confusion if accidentally trying to add the same period and year, probably worth putting in a catch on the error at some point
        } else {
        }
      });
  }

  private getSemesterFromDb(courseDbId) {
    return new Promise<any>((resolve) => {
      const semesterFromDb = {
        year:
          this.dbCourseService.getCollection("users", "courses", courseDbId).then( (res) => {resolve((res.year))} )
      };
    });
  }

  // This function gets the semester period from the course

  private getPeriodFromDb(courseDbId) {
    return new Promise<any>((resolve) => {
      const periodFromDb = {
        period: Number(
          this.dbCourseService.getCollection("users", "courses", courseDbId).then( (res) => {resolve((res.period))} )
        ),
      };
    });
  }

  private canAddSemester(semester): boolean {
    return (
      this.semesters.filter(
        (s) => s.year === semester.year && s.period === semester.period
      ).length === 0
    );
  }

  public getRandomCourse(max) {
    return Math.floor(Math.random() * max);
  }

  public periodSwitcheroo() {
    if (this.period == 1) {
        this.period = 2;
    } else {
        this.period = 1;
    }

  }

  public newYear() {
    this.year += 1;
  }

  public getEssentialCourses() {
    this.majReqs.push(this.progressPanelService.getMajReqs())
    // console.log(this.majReqs[0][2].papers[0])

    // for (let i = 0; i < this.courseService.allCourses.length; i++) {
    //     if (this.courseService.allCourses[i].name == this.majReqs[0][2].papers[0]) {
    //     console.log(this.courseService.allCourses[i])
    // }}
    for (let x = 0; x < this.majReqs[0].length; x++) {
        if (!this.majReqs[0][x].papers[0].includes("-")) {
            for (let i = 0; i < this.courseService.allCourses.length; i++) {
                for (let j = 0; j < this.majReqs[0][x].papers.length; j++) {
                    if (this.courseService.allCourses[i].name == this.majReqs[0][x].papers[j]) {
                        this.courseService.setCourseDb(this.courseService.allCourses[i], 315, this.period, this.year)
                        }
                  }       
             }

            }
            this.loadPlanFromDb();
        }

  }


  public complexCourses() {
    this.majReqs.push(this.progressPanelService.getMajReqs())

    for (let i = 0; i < this.majReqs[0].length; i++) {
        let shown = this.courseService.allCourses;
        let terms;
        if (this.majReqs[0][i].papers[0].includes("-")) {
            terms = this.majReqs[0][i].papers[0].split(" ");

    shown = shown.filter((course: any) =>
    terms.filter((term: string) => {
      const index = term.indexOf('-');
      if (index > 3) {
        const lower = Number(term.substring(index - 3, index));
        const num = Number(course.name.substring(index - 3, index));
        const upper = Number(term.substring(index + 1, index + 4));

        // console.log("lower: ", lower,"num: " , num, "upper: " ,upper)

        return num <= upper && num >= lower &&
        course.name.substring(0, index - 4).toLowerCase() ===
        term.substring(0, index - 4).toLowerCase();
      }
    })
    .length > 0);
    let complexCourseArray = [];
    for (let i = 0; i < this.courseService.allCourses.length; i++) {
        for (let j = 0; j < shown.length; j++) {
            if (this.courseService.allCourses[i].name == shown[j].name) {
                complexCourseArray.push(this.courseService.allCourses[i])

    }}}
    for (let i = 0; i < 3; i++) {
        let random = this.getRandomCourse(complexCourseArray.length)
        this.yearPeriodChecker();
        if (!this.duplicateChecker(complexCourseArray[random])) {
            this.courseService.setCourseDb(complexCourseArray[random], 315, this.period, this.year)
            complexCourseArray.splice(random, 1)
    }}

        }
        this.loadPlanFromDb();
    }
  }


  public yearPeriodChecker() {

        if (this.storeHelper.current("courses").length > 0) { 
            if (this.storeHelper.current("courses").length % 8 == 0) {
                this.newYear();
                }
    
       if (this.storeHelper.current("courses").length > 0) { 
        if (this.storeHelper.current("courses").length % 4 == 0) {
            this.periodSwitcheroo();
            }
        }

  }


  }

  public duplicateChecker(course) {

    if (this.storeHelper.current("courses").includes(course)) {
        return true;
    }

  }

}
