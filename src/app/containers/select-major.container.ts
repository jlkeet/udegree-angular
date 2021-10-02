import { Component, ViewEncapsulation } from '@angular/core';
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
import { ICourse } from '../interfaces';
import { CourseStatus } from '../models';
import { DepartmentService, FacultyService, StoreHelper } from '../services';

/*
  Container for select major page.
 */
@Component({
  selector: 'select-major-container',
  // TODO review styles -move all container styles to outlet?
  styles: [``],
  template: `
    <div class='full-page'>
      <div class='flex flex-row'>
        <progress-panel></progress-panel>
        <div class='flex flex-col flex-grow'>
          <department-list [departments]='departments' [faculty]='faculty'
          [allowsDoubleMajor]='allowsDoubleMajor' [allowsMinor]='allowsMinor'
          (deptClicked)='deptClicked($event)' [majors]='majors'></department-list>
        </div>
      </div>
    </div>
  `
})

export class SelectMajorContainer {
  private planned: ICourse[] = []; // required for the progress panel
  private majorSelected: boolean = false;
  private selected: ICourse = null;
  private departments: any[] = [];
  private faculty;
  private majors;
  private allowsMinor: boolean = false;
  private allowsDoubleMajor: boolean = false;
  private sub;

  constructor(
    private facultyService: FacultyService,
    private router: Router,
    private route: ActivatedRoute,
    private storeHelper: StoreHelper,
    private store: Store,
    private departmentService: DepartmentService
  ) {
    this.faculty = this.storeHelper.current('faculty');
    this.allowsDoubleMajor = this.facultyService.allowsDoubleMajor(this.faculty);
    this.allowsMinor = this.facultyService.allowsMinor(this.faculty);
    this.departments = this.departmentService.departmentsInFaculty(this.faculty);
    this.majors = this.storeHelper.current('majors');
  }

  public deptClicked(event) {
    this.storeHelper.update('majorSelected', true);
    this.storeHelper.update('majors', event.majors);
    this.storeHelper.update('minor', event.minor);
  }

  private ngOnInit() {
    this.sub = this.store.changes.pluck('courses').subscribe((courses: ICourse[]) => this.planned = courses);
  }

  private ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
