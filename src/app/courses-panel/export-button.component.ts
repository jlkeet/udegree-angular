import { UserContainer } from "../user/user-status.component";
import {
  Component,
  EventEmitter,
} from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import * as firebase from "firebase";
import "rxjs/Rx";
import { Store } from "../app.store";
import { AuthService } from "../core/auth.service";
import { UserService } from "../core/user.service";
import {
  Message,
} from "../models";
import {
  CourseEventService,
  CourseService,
  StoreHelper,
} from "../services";
import html2canvas from 'html2canvas';

import { MatDialog, MatDialogConfig } from '@angular/material';
import { CourseDialogComponent } from "./course-dialog.component";

@Component({
    host: {
      style: "flex: 3 0 auto;",
    },
    selector: "export-button",
    styles: [require("./courses-panel.component.scss")],
    templateUrl: "./export-button.template.html",
  })
  export class ExportButton {
  
    public email: string;
    private name: string;
    private facultyEmail: string;
    private url;
    private toggle = false;
    private status = "Export Plan"
    private onPageChange = new EventEmitter<null>();
  
    constructor(
      private db: AngularFirestore,
      public authService: AuthService,
      private userService: UserService,
      public dialog: MatDialog,
    ) {
     this.userService.getCurrentUser().then( (user) => {this.name = user.displayName, this.email = user.email}) 
    }

   private openDialog() {

      const dialogConfig = new MatDialogConfig();

      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;

      dialogConfig.data = {
        id: 1,
        title: 'Angular For Beginners'
    };

      const dialogRef = this.dialog.open(CourseDialogComponent, dialogConfig);

      dialogRef.afterClosed().subscribe(
          data => console.log("Dialog output:", data)
      );    
  }

public exportButton() {
    
    //   this.facultyEmail = this.storeHelper.current("faculty").name  
    // switch(this.facultyEmail) {
    //   case "Arts":
    //     console.log("Arts Faculty Email");
    //     this.facultyEmail = "asc@auckland.ac.nz"
    //     break;
    //   case "Science":
    //     console.log("Science Faculty Email");
    //     this.facultyEmail = "scifac@auckland.ac.nz"
    //     break;
    //   }
  
    html2canvas(document.body).then((canvas) =>  {
      this.authService.afAuth.authState.subscribe((auth) => {    
      canvas.toBlob(function(blob) {
        var newImg = document.createElement('img'),
            url = URL.createObjectURL(blob);
            let dataURL = canvas.toDataURL("image/png");
      firebase.storage().ref("/users/" + auth.email + "/images/").child("plan").put(blob).then(() => {}
        )})})})
  
        setTimeout(()=>{
          this.getImage()}, 6000);
    }
  
    private getImage() {
      var storageRef = firebase.storage().ref("/users/" + this.email + "/images/").child("plan")
      .getDownloadURL()
      .then(url => {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = (event) => {
          var blob = xhr.response;
        };
        xhr.open('GET', url);
        xhr.send();
        this.sendImage(url)
      })
      .catch((error) => {
        console.log(error)
      });
    }
  
    private sendImage(url) {
      const email = "jackson@udegree.co"
      const subject = this.name + "'s Plan"
      
     this.db
    .collection("mail")
    .add({
      from:email,
      to: this.email,
      // cc: Add Faculty Email to cc here
      message: {
          subject: subject,
          html: '<p>Here’s an attachment for you!</p>',
          attachments: [{
            filename: "plan.png",
            path: url,
            type: 'image/png',
            }],
      },
    })
    }

    private changeColor() {
      this.toggle = !this.toggle;
      this.status = this.toggle ? 'Plan Sent ✓' : 'Export Plan';
    }
}