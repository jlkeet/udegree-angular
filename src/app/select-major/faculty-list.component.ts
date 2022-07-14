import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FacultyService, ConjointService, StoreHelper } from '../services';

/*
    Simply displays a list of faculty tiles.
*/

@Component({
  selector: 'faculty-list',
  templateUrl: 'faculty-list.component.html',
  styleUrls: ['faculty-list.component.scss'],
})

// <div><a class="faculty-icon">i</a></div>
export class FacultyList {
  @Output() public facultyClicked = new EventEmitter();
  public faculties;

  constructor(
    public facultyService: FacultyService,
    public storeHelper: StoreHelper,
    public router: Router
  ) { }

  public clicked(faculty) {
    this.facultyClicked.emit({
      value: faculty
    });

    // maybe put these in the container
    this.storeHelper.update('requirements', faculty.majorRequirements);

  }

  public ngOnInit() {
    this.faculties = this.facultyService.getFaculties();
  }

}
