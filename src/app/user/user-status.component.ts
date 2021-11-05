import { Component, Input, ViewChild } from "@angular/core";
import { FirebaseUserModel } from "../core/user.model";
import { UserService } from "../core/user.service";
import { AuthService } from "../core/auth.service";
import { ActivatedRoute, Router } from "@angular/router";
import * as firebase from "firebase";
import { AngularFirestore } from "@angular/fire/firestore";
import { MatMenuTrigger } from "@angular/material";

@Component({
  selector: "user-container",
  templateUrl: "user-status.component.html",
  styles: [
    `
      .light {
        color: #ddd;

      }
      .user {
        display: inline-block;
        color: #444;
      }
      .name {
        font-size: 15px;
        height: 25px;
        margin: 0px;
        color: #444;
      }
      .a:hover {
        text-decoration: none;
        color: #444;
      }
      .email {
        font-size: 10px;
        height: 15px;
        margin-top: -10px;
      }
      .opensans {
        font-family: "Open Sans", sans-serif;
      }

      #name {
        color: #444;
        font-size: 15px;
        height: 25px;
        margin: 0px;
        font-family: Open Sans, sans-serif;
      }

      .email {
        color: #444;
        font-size: 10px;
        height: 15px;
        margin-top: -10px;
        font-family: Open Sans, sans-serif;
      }

      .user-status-button {
        padding-bottom: 12px; 
        background-color: transparent !important;
        border-width: 1px;
        border-color: transparent;
        text-align: left;
        min-width: 160px;
        padding-right: 70px;
        padding-left: 20px;
      }

      .user-status-button:active {  
        border-width: 1px;
        border-style: solid;
        border-color: #e6eaed;
        border-image: initial;
        border-radius: 5px;
        padding-bottom: 12px;     
      }
  
      .user-status-button:focus {  
        border-width: 1px;
        border-style: solid;
        border-color: #e6eaed;
        border-image: initial;
        border-radius: 5px;
        padding-bottom: 12px;     
      }

    .user-status-button:hover {  
      border-width: 1px;
      border-style: solid;
      border-color: #e6eaed;
      border-image: initial;
      border-radius: 5px;
      padding-bottom: 12px;     
    }


    .user-status-button:visited {  
      border-width: 0px;
      border-style: solid;
      border-color: #e6eaed;
      border-image: initial;
      border-radius: 5px;
      padding-bottom: 12px;     
    }

    .dropdown-menu {
      min-width: 202px !important;
      margin-top: -15px;
      border-top-color: #fff !important;
      border-color: #e6eaed;
      border-top-left-radius: 0px;
      border-top-right-radius: 0px;
      box-shadow: 0 5px 10px -2px rgba(0,0,0,.16) !important;
      -webkit-box-shadow: 0 5px 10px -2px rgba(0,0,0,.16) !important;

    }

    .chevron {
      border-style: solid;
      border-width: 0.25px 0.25px 0 0;
      content: '';
      height: 0.6em;
      right: -7.5em;
      position: relative;
      top: -0.9em;
      transform: rotate(-45deg);
      vertical-align: top;
      width: 0.6em;
      transform: rotate(135deg);
      text-align: right !important;
      
    }

    .logout_icon {
      height: 24px;
      width: 24px;
      cursor: pointer;
      margin-left: 15px;
      padding-left: 30px;

    }

    .logout_icon:hover{
      height: 24px;
      width: 24px;
      cursor: pointer;
    }

    .dropDownMenuCustom {
      padding-top: 20px;
      font-size: 16px !important;
      font-weight: 500 !important;
    }

    .dropDownMenuItem:hover{
      background-color: #0179d3;
      color: #fff;
      cursor: pointer;
    }

    .dropDownMenuItem:hover #Capa_1{
      background-color: #0179d3;
      color: #fff;
      cursor: pointer;
      fill: #fff !important;
    }

    .dropDownMenuItemText {
    margin-bottom: 1px;
    margin-top: 1px;
    margin-left: 10px;
    display: inline-block;
    }

    #Capa_1 {
      margin-left: 15px;
      transform: translateY(5.5px);
    }

    ngx-avatar {
      display: inline-block !important;
      float: left !important;
      padding-top: 10px !important;
    }

    `,
  ],
})
export class UserContainer {
  private isLoggedIn: Boolean;
  private displayName: String = "";
  private photoURL: String = "";
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
    this.authService.afAuth.authState.subscribe(async (auth) => {
      if (auth == null) {
        // Check to see if user is logged in
        this.isLoggedIn = false;
        this.photoURL= "";
        this.displayName = "";
        this.email = "";
        if (this.router.url === "/register") {
          // If user is on register page, do not re-route, otherwise go to login page
          // Do not execute anything here
        } else {
          this.router.navigate(["/login"]);
        }
      } else {
        this.isLoggedIn = true; // User is logged in
        this.logInCounter++;
        if (auth.displayName != null) {
          this.displayName = auth.displayName; // If there is a useranme from authentication then its from third party and can pull it
        } else {
          this.getUserName("users", auth.email).then(
            (value) => (this.displayName = value)
          ); // If there isn't then use getUserName to grab it from Firestore
        }
      }
      this.email = auth.email; // This has to be included here and I don't know why
      this.photoURL = auth.photoURL.split("/", 4)[3];
      this.router.navigate(["planner"]);
    });
  }

  // This function gets the users name from firestore collection.
  getUserName(collection, document) {
    return new Promise<any>((resolve) => {
      var data = this.db
        .collection(collection)
        .doc(document)
        .get()
        .toPromise()
        .then((result) => {
          resolve(result.data().name);
        });
    });
  }
}
