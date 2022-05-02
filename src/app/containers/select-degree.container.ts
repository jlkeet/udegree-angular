import { Component } from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import 'rxjs/Rx';
import { Store } from '../app.store';
import { ICourse } from '../interfaces';
import { FacultyService, ConjointService, StoreHelper } from '../services';

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
  public planned: ICourse[] = []; // required for the progress panel
  public majorSelected: boolean = false;
  public selected: ICourse = null;
  public departments: any[] = [];
  public sub;
  public email: string = "";

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public storeHelper: StoreHelper,
    public store: Store,
    public facultyService: FacultyService,
    public conjointService: ConjointService
  ) { }

  public facultyClicked(event) {
    this.storeHelper.update('faculty', event.value);
    this.storeHelper.update('conjoint', null);
    this.storeHelper.update('majors', [null, null]);
    this.storeHelper.update('secondMajors', [null, null]);
    this.storeHelper.update('thirdMajors', [null, null]);
    this.storeHelper.update('pathways', [null, null]);
    this.storeHelper.update('minor', null);


    if (this.facultyService.isPrescribed(event.value)) {
      this.router.navigate(['/planner']);
    } else {
      this.router.navigate(['/major']);
    }

  }

  public ngOnInit() {
    this.sub = this.store.changes.pluck('courses').subscribe((courses: ICourse[]) => this.planned = courses);
  }

  public ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
