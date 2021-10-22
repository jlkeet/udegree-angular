import { Component, ViewEncapsulation } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {
  ActivatedRoute,
  NavigationExtras,
  Params,
  Router,
  RouterModule
} from '@angular/router';
import { LocalStorageService } from 'angular-2-local-storage';
import 'rxjs/Rx';
import { Store } from '../app.store';
import { AuthService } from '../core/auth.service';
import { ICourse } from '../interfaces';
import { CourseStatus } from '../models';
import { FacultyService, StoreHelper } from '../services';

/*
  Container for select major page.
 */
@Component({
  selector: 'select-degree-container',
  styles: [``],
  template: `
    <div class='full-page'>
      <div class='flex flex-row'>
        <progress-panel></progress-panel>
        <div class='flex flex-col flex-grow'>
          <faculty-list (facultyClicked)='facultyClicked($event)'></faculty-list>
        </div>
      </div>
    </div>
  `
})

export class SelectDegreeContainer {
  private planned: ICourse[] = []; // required for the progress panel
  private majorSelected: boolean = false;
  private selected: ICourse = null;
  private departments: any[] = [];
  private sub;
  private email: string = "";

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storeHelper: StoreHelper,
    private store: Store,
    private facultyService: FacultyService,
  ) { }

  public facultyClicked(event) {
    this.storeHelper.update('faculty', event.value);
    this.storeHelper.update('majors', [null, null]);
    this.storeHelper.update('minor', null);


    if (this.facultyService.isPrescribed(event.value)) {
      this.router.navigate(['/planner']);
    } else {
      this.router.navigate(['/major']);
    }

  }

  private ngOnInit() {
    this.sub = this.store.changes.pluck('courses').subscribe((courses: ICourse[]) => this.planned = courses);
  }

  private ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
