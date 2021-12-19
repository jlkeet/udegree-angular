import { Injectable } from "@angular/core";
import "rxjs/add/operator/toPromise";
import { AngularFireAuth } from "@angular/fire/auth";
import * as firebase from "firebase/app";
import { FirebaseUserModel } from "./user.model";
import { AngularFirestore } from "@angular/fire/firestore";
import { UserService } from "./user.service";
import { Store } from "../app.store";
import { StoreHelper } from "../services";
import { DegreeSelection } from "../select-major";

@Injectable()
export class FirebaseDbService {
  uid: string;
  public email;

  constructor(
    public afAuth: AngularFireAuth,
    private db: AngularFirestore,
    public userdata: FirebaseUserModel,
    private userService: UserService,
    private storeHelper: StoreHelper,
    // private degreeSelect: DegreeSelection,
  ) {
    this.userService.getCurrentUser().then((user) => {
      this.email = user.email;
    });
  }

  public getCollection(firstCollection?: string, secondCollection?: string, courseDbId?: string) {
    return new Promise<any>((resolve) => {
      this.db
        .collection(firstCollection)
        .doc(this.email)
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

  public getID(email, collectionName) {
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
            this.loadPlanFromDb(collectionName, element.id);
          });
        }
      });
  }

  public getPlanFromDb(collectionName, degId) {
    return new Promise<any>(async (resolve) => {
      this.db
        .collection("users")
        .doc(this.email)
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


  public loadPlanFromDb(collectionName, degId, storeHelperName?) {
    this.getPlanFromDb(collectionName, degId).then(async (copy) => {
      Object.assign({
        abbrv: copy[0],
        blurb: copy[1],
        doubleMajorRequirements: copy[2],
        flags: copy[3],
        majorRequirements: copy[4],
        majors: copy[5],
        name: copy[6],
      });
      this.getPlanFromDb(collectionName, degId).then((res) => {
        this.storeHelper.update("facultys", res) //, this.degreeSelect.pageEmitterForDegLoad()
      });
    });
  }
}
