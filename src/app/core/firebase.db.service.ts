import { EventEmitter, Injectable, Output } from "@angular/core";
import "rxjs/add/operator/toPromise";
import { AngularFireAuth } from "@angular/fire/auth";
import { FirebaseUserModel } from "./user.model";
import { AngularFirestore } from "@angular/fire/firestore";
import { UserService } from "./user.service";
import { StoreHelper } from "../services";
import { formatDate } from "@angular/common";
import { AdminExportService } from "../services/admin-export.service";

@Injectable()
export class FirebaseDbService {
  @Output() private onPageChange = new EventEmitter<null>();
  uid: string;

  public auditDocRef;
  public previousValue;

  constructor(
    public afAuth: AngularFireAuth,
    private db: AngularFirestore,
    public userdata: FirebaseUserModel,
    private userService: UserService,
    private storeHelper: StoreHelper,
    public adminExportService: AdminExportService
  ) {
  }

  public getCollection(firstCollection?: string, secondCollection?: string, courseDbId?: string) {
    return new Promise<any>((resolve) => {
      // console.log(this.afAuth.auth.currentUser.email)
      this.db
        .collection(firstCollection)
        .doc(this.afAuth.auth.currentUser.email)
        .collection(secondCollection)
        .doc(courseDbId)
        .get()
        .toPromise()
        .then((result) => {
          resolve(result.data());
        });
    });
  }

  public setSelection(email, collectionName, collection, document) {
    this.db
    .collection("users")
    .doc(email)
    .collection(document)
    .doc(collectionName)
    .set(collection)
  }

  public addSelection(email, collectionName, collection, document) {
    this.db
    .collection("users")
    .doc(email)
    .collection(document)
    .add(collection)
  }

  public getID(email, collectionName, storeHelperName) {
    this.db
      .collection("users")
      .doc(email)
      .collection(collectionName)
      .get()
      .toPromise()
      .then((sub) => {
        if (sub.docs.length > 0) {
          // Check to see if documents exist in the courses collection
          sub.forEach((element) => {
            // Loop to get all the ids of the docs
            this.loadPlanFromDb(collectionName, element.id, storeHelperName);
          });
        }
      });
  }

  public getPlanFromDb(collectionName, degId) {
    return new Promise<any>(async (resolve) => {
      this.db
        .collection("users")
        .doc(this.afAuth.auth.currentUser.email)
        .collection(collectionName)
        .doc(degId)
        .get()
        .toPromise()
        .then((resultDegree) => {
          resolve(resultDegree.data());
          //this.facultyForEmail = resultDegree.data().name;
        });
    });
  }


  public loadPlanFromDb(collectionName, degId, storeHelperName) {
    this.getPlanFromDb(collectionName, degId).then(async (copy) => {
      Object.assign({
        abbrv: copy['abbrv'] || null,
        blurb: copy['blurb'] || null,
        doubleMajorRequirements: copy['doubleMajorRequirements'] || null,
        flags: copy['flags'] || null,
        majorRequirements: copy['majorRequirements'] || null,
        majors: copy['majors'] || null,
        name: copy['name'] || null,
        conjointRequirements: ['conjointRequirements'] || null,
        faculties: copy['faculties'] || null,
        requirements: copy['requirements'] || null,
        courses: copy['courses'] || null,
      });
      this.getPlanFromDb(collectionName, degId).then((res) => {
        this.storeHelper.update(storeHelperName, res)
      });
    });
  }

  public getStudentEmailForAudit() {
    return new Promise<any>(async (resolve) => {
    this.db
    .collection("users")
    .doc(this.afAuth.auth.currentUser.email)
    .get()
    .toPromise()
    .then( res => {  resolve(res.data()); } )
  })
}


  public setAuditLogAction() {
    if (!this.adminExportService.isAdmin) {
    let timestamp = Date.now();
    let timestampString = formatDate(timestamp, 'dd/MM/yyyy, h:mm a', 'en')
    this.getStudentEmailForAudit().then( (res) => 

    this.db
    .collection("audit-log")
    .add({ admin: this.afAuth.auth.currentUser.email, student: res.student, timestamp: timestampString , actions: [] })
    .then( (docRef) => this.auditDocRef = docRef.id))
  }
  }

  public setAuditLogDegree(degree) {
    if (!this.adminExportService.isAdmin) {
    let timestamp = Date.now();
    let timestampString = formatDate(timestamp, 'dd/MM/yyyy, h:mm a', 'en')

    this.previousValue = this.storeHelper.current("degree")
    this.db
    .collection("audit-log")
    .doc(this.auditDocRef)
    .collection("actions")
    .add({ timestamp: timestampString ,action: "Added Degree", new: degree, previous: this.previousValue || "" })
    }
  }

  public setAuditLogDeleteDegree() {
    if (!this.adminExportService.isAdmin) {
    let timestamp = Date.now();
    let timestampString = formatDate(timestamp, 'dd/MM/yyyy, h:mm a', 'en')

    this.previousValue = this.storeHelper.current("degree")
    this.db
    .collection("audit-log")
    .doc(this.auditDocRef)
    .collection("actions")
    .add({ timestamp: timestampString ,action: "Removed Degree", new: "", previous: this.previousValue || "" })
    }
  }

  public setAuditLogMajor(major) {
    if (!this.adminExportService.isAdmin) {
    let timestamp = Date.now();
    let timestampString = formatDate(timestamp, 'dd/MM/yyyy, h:mm a', 'en')

    this.previousValue = this.storeHelper.current("major")
    this.db
    .collection("audit-log")
    .doc(this.auditDocRef)
    .collection("actions")
    .add({ timestamp: timestampString ,action: "Added Major", new: major, previous: this.previousValue || "" })
    }
  }

  public setAuditLogDeleteMajor() {
    if (!this.adminExportService.isAdmin) {
    let timestamp = Date.now();
    let timestampString = formatDate(timestamp, 'dd/MM/yyyy, h:mm a', 'en')

    this.previousValue = this.storeHelper.current("major")
    this.db
    .collection("audit-log")
    .doc(this.auditDocRef)
    .collection("actions")
    .add({ timestamp: timestampString ,action: "Removed Major", new: "", previous: this.previousValue || "" })
    }
  }


  public setAuditLogSecondMajor(secondMajor) {
    if (!this.adminExportService.isAdmin) {
    let timestamp = Date.now();
    let timestampString = formatDate(timestamp, 'dd/MM/yyyy, h:mm a', 'en')

    this.previousValue = this.storeHelper.current("secondMajor")
    this.db
    .collection("audit-log")
    .doc(this.auditDocRef)
    .collection("actions")
    .add({ timestamp: timestampString ,action: "Added Second Major", new: secondMajor, previous: this.previousValue || "" })
    }
  }

  public setAuditLogDeleteSecondMajor() {
    if (!this.adminExportService.isAdmin) {
    let timestamp = Date.now();
    let timestampString = formatDate(timestamp, 'dd/MM/yyyy, h:mm a', 'en')

    this.previousValue = this.storeHelper.current("secondMajor")
    this.db
    .collection("audit-log")
    .doc(this.auditDocRef)
    .collection("actions")
    .add({ timestamp: timestampString ,action: "Removed Second Major", new: "", previous: this.previousValue || "" })
    }
  }

  public setAuditLogThirdMajor(thirdMajor) {
    if (!this.adminExportService.isAdmin) {
    let timestamp = Date.now();
    let timestampString = formatDate(timestamp, 'dd/MM/yyyy, h:mm a', 'en')

    this.previousValue = this.storeHelper.current("thirdMajor")
    this.db
    .collection("audit-log")
    .doc(this.auditDocRef)
    .collection("actions")
    .add({ timestamp: timestampString ,action: "Added Third Major", new: thirdMajor, previous: this.previousValue || "" })
    }
  }

  public setAuditLogDeleteThirdMajor() {
    if (!this.adminExportService.isAdmin) {
    let timestamp = Date.now();
    let timestampString = formatDate(timestamp, 'dd/MM/yyyy, h:mm a', 'en')

    this.previousValue = this.storeHelper.current("thirdMajor")
    this.db
    .collection("audit-log")
    .doc(this.auditDocRef)
    .collection("actions")
    .add({ timestamp: timestampString ,action: "Removed Third Major", new: "", previous: this.previousValue || "" })
    }
  }

  public setAuditLogModule(module) {
    if (!this.adminExportService.isAdmin) {
    let timestamp = Date.now();
    let timestampString = formatDate(timestamp, 'dd/MM/yyyy, h:mm a', 'en')

    this.previousValue = this.storeHelper.current("module")
    this.db
    .collection("audit-log")
    .doc(this.auditDocRef)
    .collection("actions")
    .add({ timestamp: timestampString ,action: "Added Module", new: module, previous: this.previousValue || "" })
    }
  }

  public setAuditLogDeleteModule() {
    if (!this.adminExportService.isAdmin) {
    let timestamp = Date.now();
    let timestampString = formatDate(timestamp, 'dd/MM/yyyy, h:mm a', 'en')

    this.previousValue = this.storeHelper.current("module")
    this.db
    .collection("audit-log")
    .doc(this.auditDocRef)
    .collection("actions")
    .add({ timestamp: timestampString ,action: "Added Module", new: "", previous: this.previousValue || "" })
    }
  }

  public setAuditLogSecondModule(secondModule) {
    if (!this.adminExportService.isAdmin) {
    let timestamp = Date.now();
    let timestampString = formatDate(timestamp, 'dd/MM/yyyy, h:mm a', 'en')

    this.previousValue = this.storeHelper.current("secondModule")
    this.db
    .collection("audit-log")
    .doc(this.auditDocRef)
    .collection("actions")
    .add({ timestamp: timestampString ,action: "Added Second Module", new: module, previous: this.previousValue || "" })
    }
  }

  public setAuditLogDeleteSecondModule() {
    if (!this.adminExportService.isAdmin) {
    let timestamp = Date.now();
    let timestampString = formatDate(timestamp, 'dd/MM/yyyy, h:mm a', 'en')

    this.previousValue = this.storeHelper.current("secondModule")
    this.db
    .collection("audit-log")
    .doc(this.auditDocRef)
    .collection("actions")
    .add({ timestamp: timestampString ,action: "Removed Second Module", new: "", previous: this.previousValue || "" })
    }
  }


  public setAuditLogConjoint(conjoint) {
    if (!this.adminExportService.isAdmin) {
    let timestamp = Date.now();
    let timestampString = formatDate(timestamp, 'dd/MM/yyyy, h:mm a', 'en')

    this.previousValue = this.storeHelper.current("conjoint")
    this.db
    .collection("audit-log")
    .doc(this.auditDocRef)
    .collection("actions")
    .add({ timestamp: timestampString ,action: "Added Conjoint", new: conjoint, previous: this.previousValue || "" })
    }
  }

  public setAuditLogDeleteConjoint() {
    if (!this.adminExportService.isAdmin) {
    let timestamp = Date.now();
    let timestampString = formatDate(timestamp, 'dd/MM/yyyy, h:mm a', 'en')

    this.previousValue = this.storeHelper.current("conjoint")
    this.db
    .collection("audit-log")
    .doc(this.auditDocRef)
    .collection("actions")
    .add({ timestamp: timestampString ,action: "Removed Conjoint", new: "", previous: this.previousValue || "" })
    }
  }

  public setAuditLogPathway(pathway) {
    if (!this.adminExportService.isAdmin) {
    let timestamp = Date.now();
    let timestampString = formatDate(timestamp, 'dd/MM/yyyy, h:mm a', 'en')

    this.previousValue = this.storeHelper.current("pathway")
    this.db
    .collection("audit-log")
    .doc(this.auditDocRef)
    .collection("actions")
    .add({ timestamp: timestampString ,action: "Added Pathway", new: pathway, previous: this.previousValue || "" })
    }
  }

  public setAuditLogDeletePathway() {
    if (!this.adminExportService.isAdmin) {
    let timestamp = Date.now();
    let timestampString = formatDate(timestamp, 'dd/MM/yyyy, h:mm a', 'en')

    this.previousValue = this.storeHelper.current("pathway")
    this.db
    .collection("audit-log")
    .doc(this.auditDocRef)
    .collection("actions")
    .add({ timestamp: timestampString ,action: "Removed pathway", new: "", previous: this.previousValue || "" })
    }
  }


  public setAuditLogCourse(course) {
    if (!this.adminExportService.isAdmin) {
    let timestamp = Date.now();
    let timestampString = formatDate(timestamp, 'dd/MM/yyyy, h:mm a', 'en')
    console.log(this.auditDocRef)
    this.db
    .collection("audit-log")
    .doc(this.auditDocRef)
    .collection("actions")
    .add({ timestamp: timestampString ,action: "Added Course", new: course, previous: this.previousValue || "" })
    }
  }

  public setAuditLogDeleteCourse(course) {
    if (!this.adminExportService.isAdmin) {
    let timestamp = Date.now();
    let timestampString = formatDate(timestamp, 'dd/MM/yyyy, h:mm a', 'en')

    console.log(course)

    this.previousValue = course
    this.db
    .collection("audit-log")
    .doc(this.auditDocRef)
    .collection("actions")
    .add({ timestamp: timestampString ,action: "Removed Course", new: "", previous: this.previousValue || "" })
    }
  }


  public setAuditLogSemester(semester) {
    if (!this.adminExportService.isAdmin) {
    let timestamp = Date.now();
    let timestampString = formatDate(timestamp, 'dd/MM/yyyy, h:mm a', 'en')

    this.db
    .collection("audit-log")
    .doc(this.auditDocRef)
    .collection("actions")
    .add({ timestamp: timestampString ,action: "Added Semester", new: semester, previous: this.previousValue || "" })
    }
  }

  public setAuditLogDeleteSemester(semester) {
    if (!this.adminExportService.isAdmin) {
    let timestamp = Date.now();
    let timestampString = formatDate(timestamp, 'dd/MM/yyyy, h:mm a', 'en')

    this.previousValue = semester
    this.db
    .collection("audit-log")
    .doc(this.auditDocRef)
    .collection("actions")
    .add({ timestamp: timestampString ,action: "Removed Semester", new: "", previous: this.previousValue || "" })
    }
  }

}
