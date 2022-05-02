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
import { updateHeritageClause } from "typescript";

@Component({
    host: {
      style: "flex: 3 0 auto;",
    },
    selector: "export-button",
    styles: [require("./courses-panel.component.scss")],
    templateUrl: "./export-button.template.html",
  })
  export class ExportButton {
    static exportButton() {
        throw new Error("Method not implemented.");
    }
  
    public email: string;
    public name: string;
    public facultyEmail: string;
    public url;
    public toggle = false;
    public status = "Export Plan"
    public onPageChange = new EventEmitter<null>();
  
    constructor(
      public db: AngularFirestore,
      public authService: AuthService,
      public userService: UserService,
      public dialog: MatDialog,
    ) {
     this.userService.getCurrentUser().then( (user) => {this.name = user.displayName, this.email = user.email}) 
    }

   public openDialog() {

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

    public changeColor() {
      this.toggle = !this.toggle;
      this.status = this.toggle ? 'Plan Sent ✓' : 'Export Plan';
    }
}