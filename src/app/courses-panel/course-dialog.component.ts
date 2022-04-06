import { Component, EventEmitter, Inject, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { FormBuilder, FormGroup } from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef, MatDialog} from "@angular/material";
import { AuthService } from "../core/auth.service";
import { UserService } from "../core/user.service";
import { ExportButton } from "./export-button.component";
import html2canvas from 'html2canvas';
import * as firebase from "firebase";

@Component({
    selector: 'course-dialog',
    templateUrl: './course-dialog.template.html',
    styleUrls: ['./courses-panel.component.scss']
})
export class CourseDialogComponent implements OnInit {

    form: FormGroup;
    description:string;

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
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<CourseDialogComponent>,
        @Inject(MAT_DIALOG_DATA) data) {

        this.description = data.description;
        this.userService.getCurrentUser().then( (user) => {this.name = user.displayName, this.email = user.email}) 
    }

    ngOnInit() {
        this.form = this.fb.group({
            description: [this.description, []]
            });
    }

    save() {
        this.dialogRef.close();
    }

    close() {
        this.dialogRef.close();
    }



public exportButton() {
    console.log("firing export")
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
  
      this.facultyEmail = "jackson@udegree.co"
      setTimeout(()=>{

      html2canvas(document.body).then((canvas) =>  {
        console.log("firing html2canvas")
        this.authService.afAuth.authState.subscribe((auth) => {    
        canvas.toBlob(function(blob) {
          var newImg = document.createElement('img'),
              url = URL.createObjectURL(blob);
              let dataURL = canvas.toDataURL("image/png");
        firebase.storage().ref("/users/" + auth.email + "/images/").child("plan").put(blob).then(() => {console.log("firing")}
          )})})})

        }, 2000);

          setTimeout(()=>{
            this.getImage()}, 9000);
      }
    
      private getImage() {
        console.log("firing get image")
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
        console.log("firing send image")
        const email = "jackson@udegree.co"
        const subject = this.name + "'s Plan"
        
       this.db
      .collection("mail")
      .add({
        from: email,
        to: "jackson.keet@mac.com",
        cc: this.email,
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

}