import { Injectable } from '@angular/core';
import { Component, Input } from "@angular/core";
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from "@angular/fire/firestore";
import { AuthService } from "../core/auth.service";

@Injectable()
export class AdminExportService {

    public adminStatus;

    constructor(public authService: AuthService, public db: AngularFirestore, public afAuth: AngularFireAuth,) {
    }

    public setExportStatus(adminStatus) {    
        this.db
        .collection("users")
        .doc("jackson.keet1989@gmail.com")
        .update({status: adminStatus})
        this.adminStatus = adminStatus;
      }

    public getStatus() {
        return this.adminStatus;
      }

      public getExportStatus() {
        return new Promise<any>((resolve) => {
          var data = this.db
            .collection("users")
            .doc("jackson.keet1989@gmail.com")
            .get()
            .toPromise()
            .then((result) => {
              resolve(this.adminStatus = result.data().status);
            });
        });
      }

  }
  