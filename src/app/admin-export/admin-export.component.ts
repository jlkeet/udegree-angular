import { Component, Input } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AuthService } from "../core/auth.service";
import { AdminExportService } from "../services/admin-export.service"

/*
      A component for exporting to admin site.
  */

@Component({
  selector: "admin-export",
  templateUrl: "./admin-export.template.html",
  styleUrls: ["./admin-export.component.scss"],
})
export class AdminExport {
  public adminStatus;
  public isAdmin;

  constructor(public adminService: AdminExportService) {

  }

  public ngOnInit() {
    // this.adminService.getExportStatus();
    // this.adminService.getAdmin();

  }

}