import {
  Component,
  EventEmitter,
  Injectable,
  Input,
  Output,
} from '@angular/core';
import { ICourse } from '../interfaces';
import { CourseStatus } from '../models';
import { DepartmentService, FacultyService, RequirementService, ConjointService } from '../services';

/*
    Component for filtering a list of courses by eligibility / search term
    TODO: split into smaller components
 */
@Component({
  selector: 'course-filter',
  styles: [require('./course-filter.component.scss')],
  templateUrl: './course-filter.template.html'
})

@Injectable()
export class CourseFilter {
  @Output() private toggleChange = new EventEmitter();
  @Output() private searchChange = new EventEmitter();

  @Input() private courses: ICourse[];
  @Input() private planned: ICourse[];
  @Input() private filterParams: any;

  private facultyChoices;
  private conjointChoices;
  private departmentChoices;
  private campusChoices = [
    {value: 'City', label: 'City'},
    {value: 'Tamaki', label: 'Tamaki'},
    {value: 'Grafton', label: 'Grafton'},
    {value: 'Newmarket', label: 'Newmarket'},
    {value: 'Epsom', label: 'Epsom'},
  ];

  private plannedNames;
  private stageChoices = [
    {value: 1, label: '100'},
    {value: 2, label: '200'},
    {value: 3, label: '300'},
    {value: 4, label: '400+'}
  ];

  constructor(
    private departmentService: DepartmentService,
    private facultyService: FacultyService,
    private requirementService: RequirementService,
    private conjointService: ConjointService
  ) { }

  public ngOnInit() {
    this.departmentChoices = this.departmentService.getDepartments()
      .map((department) => {
        return { value: department.name, label: department.name };
      });

    this.facultyChoices = this.facultyService.getFaculties()
      .map((faculty) => {
        return { value: faculty.name, label: faculty.name };
      });
  

  this.conjointChoices = this.conjointService.getConjoints()
  .map((conjoint) => {
    return { value: conjoint.name, label: conjoint.name };
  });

}

  public ngOnChanges() {
    this.plannedNames = this.planned.filter((course: ICourse) => course.status !== CourseStatus.Failed)
      .map((course: ICourse) => course.name);
    this.onChange(null, null, null);
  }

  public onChange(event, whichSwitch, noUpdate) {
    let shown = this.courses;
    const flags = [];
    const modules = this.filterParams.modules;
    if (this.filterParams.ineligible) {
      shown = shown.filter((course: ICourse) => course.canAdd);
    }
    if (this.filterParams.general) {
      flags['general'] = true;
    }
    if (this.filterParams.modules) {
      flags['modules'] = true;
    }
    if (this.filterParams.hidePlanned) {
      shown = shown.filter((course: ICourse) => !this.plannedNames.includes(course.name));
    }
    const requirement = {
      departments: this.filterParams.departments.length !== 0 ? this.toArray(this.filterParams.departments) : null,
      faculties: this.filterParams.faculties.length !== 0 ? this.toArray(this.filterParams.faculties) : null,
      flags,
      required: 0,
      stages: this.filterParams.stage.length !== 0 ? this.toArray(this.filterParams.stage).map((n) => Number(n)) : null,
      type: 0
    };
    shown = this.requirementService.filterByRequirement(requirement, shown);


    // This has grown too much, try to simplify
    if (this.filterParams.searchTerm !== '' && this.filterParams.searchTerm !== null) {
      let terms = [this.filterParams.searchTerm];
      if (this.filterParams.searchTerm.includes(',')) {
        terms = this.filterParams.searchTerm.split(',').map((term: string) => term.trim());
      }
      shown = shown.filter((course: ICourse) =>
        terms.filter((term: string) => {
          const index = term.indexOf('-');
          if (index > 3) {
            const lower = Number(term.substring(index - 3, index));
            const num = Number(course.name.substring(index - 3, index));
            const upper = Number(term.substring(index + 1, index + 4));
            return num <= upper && num >= lower &&
            course.name.substring(0, index - 4).toLowerCase() ===
              term.substring(0, index - 4).toLowerCase();
          } else {
            return course.name.toLowerCase().includes(term.toLowerCase());
          }
        })
        .length > 0);
    }

    this.toggleChange.emit({
      noUpdate,
      shown,
      modules
    });
  }

  private toArray(arg) {
    if (!arg) {
      return [];
    }
    if (arg.constructor === Array) {
      return arg;
    }
    return arg.split(',');
  }

}
