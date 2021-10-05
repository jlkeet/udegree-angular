import { Injectable } from "@angular/core";
import 'rxjs/add/operator/toPromise';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { FirebaseUserModel } from './user.model';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class AuthService {

  uid: string;
  

  constructor(
   public afAuth: AngularFireAuth,
   private db: AngularFirestore,
   public userdata: FirebaseUserModel,
    
 ) { }


  doFacebookLogin(){
    return new Promise<any>((resolve, reject) => {
      let provider = new firebase.auth.FacebookAuthProvider();
      this.afAuth.auth // Need to add user data storage
      .signInWithPopup(provider)
      .then(res => {
        resolve(res);
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
        resolve(res);
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
        resolve(res);
      }, err => reject(err))
    })
  }


  doLogin(value){
    return new Promise<any>((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(value.email, value.password)
      .then(res => {
        resolve(res);
      }, err => reject(err))
    })
  }

  doLogout(){
    return new Promise<void>((resolve, reject) => {
      if(firebase.auth().currentUser){
        this.afAuth.auth.signOut();
        resolve();
      }
      else{
        reject();
      }
    });
  }
}
