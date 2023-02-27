import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { FirebaseUserModel } from './user.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { AdminExportService } from "../services/admin-export.service";

@Injectable()
export class AuthService {

  public logInCounter = 0;
  public isLoggedIn = false;


  uid: string;

  constructor(
   public afAuth: AngularFireAuth,
   private db: AngularFirestore,
   public userdata: FirebaseUserModel,
   public adminService: AdminExportService,

 ) { }

  doFacebookLogin(){
    return new Promise<any>((resolve, reject) => {
      let provider = new firebase.auth.FacebookAuthProvider();
      this.afAuth.auth
      .signInWithPopup(provider)
      .then(res => {
        this.db
        .collection("users") // Here is where we set the docID to the email so its accessible in the database.
        .doc(res.user.email)
        .set({email: res.user.email, name: res.user.displayName})
        resolve(res);
        this.isLoggedIn = true;
      }, err => {
        console.log(err);
        reject(err);
      })
    })
  }

  doTwitterLogin(){
    return new Promise<any>((resolve, reject) => {
      let provider = new firebase.auth.TwitterAuthProvider();
      this.afAuth.auth
      .signInWithPopup(provider)
      .then(res => {
        resolve(res);
      }, err => {
        console.log(err);
        reject(err);
      })
    })
  }

  doGoogleLogin(){
    return new Promise<any>((resolve, reject) => {
      let provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email'); // Need to add user data storage
      this.afAuth.auth
      .signInWithPopup(provider)
      .then(res => {
        this.db
        .collection("users") // Here is where we set the docID to the email so its accessible in the database.
        .doc(res.user.email)
        .update({email: res.user.email, name: res.user.displayName, role: "user"})
        resolve(res);
        this.isLoggedIn = true;
      }, err => {
        console.log(err);
        reject(err);
      })
    })
  }

  doRegister(value){
    return new Promise<any>((resolve, reject) => {
      firebase.auth().createUserWithEmailAndPassword(value.email, value.password)
      this.db
      .collection("users") // Here is where we set the docID to the email so its accessible in the database.
      .doc(value.email)
      .set(value)
      .then(res => {
        this.db
        .collection("users") // Here is where we set the docID to the email so its accessible in the database.
        .doc(value.email)
        .update({email: value.email, role: "user", status: 0})
        resolve(res);
        this.isLoggedIn = true;
      }, err => reject(err))
    })
  }


  doLogin(value){
    return new Promise<any>((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(value.email, value.password)
      .then(res => {
        resolve(res);
        this.isLoggedIn = true;
      }, err => reject(err))
    })
  }

  doLogout(){
    this.adminService.storeHelper.update("courses", []);
    return new Promise<void>((resolve, reject) => {
      if(firebase.auth().currentUser){
        this.isLoggedIn = false;
        this.afAuth.auth.signOut();
        resolve();
      }
      else{
        reject();
      }
    });
  }

  public getLoggedIn() {
    return this.afAuth.auth.currentUser;
  }

}
