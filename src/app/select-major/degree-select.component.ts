import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DepartmentService, FacultyService, StoreHelper } from '../services';

@Component({
  selector: 'degree-select',
  styles: [`
    .content {
    }

    .title {
      background:white;
      font-family: "Open Sans", sans-serif;
      margin-bottom:5px;
    }

    .degree-select {
    }
    .form-field {
      display:flex;
      flex-direction:column;
      margin-left:20px;
      margin-right:20px;
      font-family: "Open Sans", sans-serif;
    }

    .edit-button{
      cursor:pointer;
      width:25px;
      height:25px;
      border-radius:5px;
      border: 1px solid;
      text-align:center;
      color:#bbf;
      font-size:24px;
    }

    .right {
      float:right;
      margin-right:20px;
    }

    .blurb {
       padding-left:20px;
       padding-right:20px;
       color: #666
       }
  `],
  templateUrl: './degree-select.template.html'
})

export class DegreeSelection {
  @Output() private onPageChange = new EventEmitter<null>();

  private degreeTypes = [
    {value: 'regular', view: 'Regular'},
    {value: 'conjoint', view: 'Conjoint'}
  ];

  private degreeType;
  private faculties = [];
  private currentFaculties;
  private majors = [[], []];
  private degree = null;
  private currentMajors = [];
  private doubleMajorAllowed;

  private defaultBlurb =
    'An undergraduate degree (e.g. Bachelor) is the award you recieve once you have completed your course of study. It is where most first-time university students commence their tertiary studies. To obtain your degree you must complete a specified number and combination of units. Most undergraduate degrees can be completed in 3-5 years of full-time study or 6-10 years part-time.';
  private blurb;

  constructor(
    private facultyService: FacultyService,
    private storeHelper: StoreHelper,
    private departmentService: DepartmentService) {
    this.degreeType = storeHelper.current('degreeType');
    if (this.degreeType === undefined) {
      this.degreeType = 'regular';
    }
    this.currentFaculties = [storeHelper.current('faculty'), null];
    if (this.currentFaculties[0] === null) {
      this.currentFaculties = [null, null];
    }
    this.checkFlags();
    this.faculties = facultyService.getFaculties().
      map((faculty) => {
        return {value: faculty, view: faculty.name};
      });
    this.populateMajors();
    this.currentMajors = storeHelper.current('majors');
    if (this.currentMajors === undefined) {
      this.currentMajors = [null, null];
    }
  }

  private checkFlags() {
    if (this.currentFaculties[0] !== null) {
      const flags = this.currentFaculties[0].flags;
      this.doubleMajorAllowed = flags.includes('Dbl Mjr');
    }
  }

  // switches between conjoint and regular
  // some degrees can't be double majors or conjoint
  private changeDegree() {
    if (this.degreeType === 'regular') {
      this.currentFaculties[1] = null;
      this.majors[1] = this.majors[0];
    } else {
      this.currentMajors[1] = null;
    }
    this.blurb = '';
  }

  private populateMajors() {
    const secondFaculty =
      (this.degreeType === 'conjoint' ? this.currentFaculties[1] : this.currentFaculties[0]);
    console.log(this.currentFaculties);
    if (this.currentFaculties[0] !== null) {
      this.majors[0] = this.departmentService.
        departmentsInFaculty(this.currentFaculties[0]).
        map((department) => {
          return {value: department, view: department.name};
        });
    }

    if (secondFaculty !== null) {
      this.majors[1] = this.departmentService.
        departmentsInFaculty(secondFaculty).
        map((department) => {
          return {value: department, view: department.name};
        });
    }
  }

  private changeFaculty(which, event) {
    const facultyNames = this.currentFaculties.map((faculty) => faculty ? faculty.name : null);
    this.changeBlurb(this.currentFaculties[which].blurb);
    if (this.degreeType === 'regular') {
      this.currentMajors = [null, null];
    } else {
      this.currentMajors[which] = null;
    }
    this.storeHelper.update('faculty', this.currentFaculties[0]);
    this.checkFlags();
    this.populateMajors();
  }

  private changeMajor(which, event) {
    this.changeBlurb(this.currentMajors[which].blurb);
    this.storeHelper.update('majors', this.currentMajors);

  }

  private changeBlurb(blurb: string) {
    if (blurb) {
      this.blurb = blurb;
    } else {
      this.blurb = this.defaultBlurb;
    }
  }

  // this is repeated in the html, should consolidate
  private changePage() {
    if (this.currentMajors[0] && (this.degreeType === 'regular' || this.currentMajors[1])) {
      this.onPageChange.emit();
    }
  }

}
