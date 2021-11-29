import { Injectable } from "@angular/core";
import "rxjs/add/operator/toPromise";
import { AngularFireAuth } from "@angular/fire/auth";
import * as firebase from "firebase/app";
import { FirebaseUserModel } from "./user.model";
import { AngularFirestore } from "@angular/fire/firestore";
import { UserService } from "./user.service";

@Injectable()
export class FirebaseDbService {
  uid: string;
  public email;

  constructor(
    public afAuth: AngularFireAuth,
    private db: AngularFirestore,
    public userdata: FirebaseUserModel,
    private userService: UserService
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
          //console.log(result.data());
        });
    });
  }
}
