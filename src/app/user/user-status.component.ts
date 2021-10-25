import { Component, Input, ViewChild } from '@angular/core';
import { FirebaseUserModel } from '../core/user.model';
import { UserService } from '../core/user.service';
import { AuthService } from '../core/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatMenuTrigger } from '@angular/material';


@Component({
  selector: 'user-container',
  templateUrl: 'user-status.component.html',
  styles: [`
  .light {
    color:#ddd;
  }
  .user{
    display:inline-block;
    color: #444;
  }
  .name{
    font-size:15px;
    height:25px;
    margin:0px;
    color: #444;
  }
  .a:hover {
    text-decoration: none;
    color: #444;
  }
  .email{
    font-size:10px;
    height:15px;
    margin-top:-10px;
  }
  .opensans {
    font-family: "Open Sans", sans-serif
  }
    `]
})
export class UserContainer {

  private isLoggedIn: Boolean;
  private displayName: String = "";
  public email: String = "";
  private uid: String;  
  public logInCounter = 0;

  constructor(


    public userService: UserService,
    public authService: AuthService,
    public db: AngularFirestore,
    private router: Router,
    private user: FirebaseUserModel

  ) {
    this.authService.afAuth.authState.subscribe(
      async (auth) => {
        if (auth == null) {                   // Check to see if user is logged in
          this.isLoggedIn = false;
          this.displayName = '';
          this.email = '';
          if (this.router.url === "/register") {  // If user is on register page, do not re-route, otherwise go to login page
            // Do not execute anything here
          } else {
            this.router.navigate(['/login']);
          }
        } else {
          this.isLoggedIn = true; // User is logged in
          console.log("Logged in")
          this.logInCounter++;
        //  console.log("the count is " + this.logInCounter)
          if (auth.displayName != null ) {
            this.displayName = auth.displayName; // If there is a useranme from authentication then its from third party and can pull it
          } else {
            this.getUserName('users', auth.email).then(
              (value) => this.displayName = value) // If there isn't then use getUserName to grab it from Firestore
            }
          }
          this.email = auth.email; // This has to be included here and I don't know why
          this.router.navigate(['planner']);
        }
    )}

// This function gets the users name from firestore collection. 

getUserName(collection, document) {
  return new Promise<any>((resolve) => {
  var data = this.db.collection(collection).doc(document).get().toPromise().then(result => {
    resolve(result.data().name);
})})


  }

}
