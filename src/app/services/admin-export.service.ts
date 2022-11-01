import { formatDate } from "@angular/common";
import { Injectable } from "@angular/core";
import { Component, Input } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { AuthService } from "../core/auth.service";

@Injectable()
export class AdminExportService {
  public adminStatus;
  public isAdmin;

  constructor(
    public authService: AuthService,
    public db: AngularFirestore,
    public afAuth: AngularFireAuth,
  ) {}

  public getAdmin(userEmail) {
      this.db
      .collection("users")
      .doc(userEmail)
      .get()
      .toPromise()
      .then( (result) => {return this.isAdmin = result.data().role === "user"})
  }

  public setExportStatus(adminStatus, userEmail) {
    this.db
      .collection("users")
      .doc(this.afAuth.auth.currentUser.email)
      .update({ status: adminStatus });
    this.adminStatus = adminStatus;
  }

  public getStatus() {
    return this.adminStatus;
  }

  public getExportStatus(userEmail) {
    return new Promise<any>((resolve) => {
      var data = this.db
        .collection("users")
        .doc(userEmail)
        .get()
        .toPromise()
        .then((result) => {
          resolve((this.adminStatus = result.data().status));
        });
    });
  }

  public setExportStatusTimestamp(userEmail) {
    let timestamp = Date.now();
    let timestampString = formatDate(timestamp, "dd/MM/yyyy, h:mm a", "en");
      this.db
      .collection("users")
      .doc(this.afAuth.auth.currentUser.email)
      .update({timestamp: timestampString})
  }
}
