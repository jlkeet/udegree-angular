import { Component, Input } from '@angular/core';
import { FirebaseUserModel } from '../core/user.model';
import { UserService } from '../core/user.service';
import { AuthService } from '../core/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';
import { getNameOfDeclaration } from 'typescript';


@Component({
  selector: 'user-container',
  templateUrl: 'user-status.component.html',
  styles: [`
  .light {
    color:#ddd;
  }
  .circle {
    font-size:40px
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
  private email: String;
  private id: String = "";
  

  user: FirebaseUserModel = new FirebaseUserModel();

  constructor(
    public userService: UserService,
    public authService: AuthService,
    public db: AngularFirestore,
    private router: Router


  ) {

    this.authService.afAuth.authState.subscribe(
      async (auth) => {
        if (auth == null) {
          console.log("Logged out");
          this.isLoggedIn = false;
          this.displayName = '';
          this.email = '';
          if (this.router.url === "/register") {

          } else {
            this.router.navigate(['/login']);
          }
        } else {
          this.isLoggedIn = true;

          this.getDocumentId('users').then(
            (docId) => this.id = docId)
          

          if (this.displayName.length > 0) {
            console.log("null is firing")
            this.displayName = auth.displayName;
          } else {
          this.getUserName('users', 'QaAUE6ODif6k78c4myiW').then(
            (value) => this.displayName = value)}
          this.email = auth.email;
          console.log("Logged in");
          this.router.navigate(['planner']);
        }
      }
    );
  }

getDocumentId(collection) {
  return new Promise<any>((resolve) => {
    var doc_data = this.db.collection(collection).get().toPromise().then(result => {
      result.docs.forEach(doc => {console.log(doc.id)})
      resolve(result.docs);
  })})
} 

getUserName(collection, document) {
  return new Promise<any>((resolve) => {
  var data = this.db.collection(collection).doc(document).get().toPromise().then(result => {
    resolve(result.data().name);
})})
  }
}
