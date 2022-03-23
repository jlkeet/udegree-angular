import { Component, Input, ViewChild } from "@angular/core";
import { FirebaseUserModel } from "../core/user.model";
import { UserService } from "../core/user.service";
import { AuthService } from "../core/auth.service";
import { ActivatedRoute, Router } from "@angular/router";
import { AngularFirestore } from "@angular/fire/firestore";
import { LeftPanelContainer } from "../containers";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { CourseDialogComponent } from "../courses-panel/course-dialog.component";
import { UserDialogComponent } from "./user-dialog-component";

@Component({
  selector: "user-container",
  templateUrl: "user-status.component.html",
  styles: [require("./user-status.component.scss")],
})
export class UserContainer {
  private isLoggedIn: Boolean;
  private displayName: String = "";
  private photoURL: String = "";
  public email: string = "";
  private uid: String;
  public logInCounter = 0;
  public isMobile;


  constructor(
    public userService: UserService,
    public authService: AuthService,
    public db: AngularFirestore,
    private router: Router,
    private user: FirebaseUserModel,
    private leftPanel: LeftPanelContainer,
    private dialog: MatDialog
  ) {

    this.authService.afAuth.authState.subscribe(async (auth) => {
      this.isMobile = leftPanel.mobile;
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
        this.email = auth.email; // This has to be included here and I don't know why
        if (auth.photoURL) {
        this.photoURL = auth.photoURL.split("/", 4)[3];
        }
        this.router.navigate(["planner"]);
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

  private openDialog() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    dialogConfig.data = {
      id: 1,
      title: 'Angular For Beginners'
  };

    const dialogRef = this.dialog.open(UserDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
        data => console.log("Dialog output:", data)
    );    
}

}
