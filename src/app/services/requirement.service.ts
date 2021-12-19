import { Injectable } from '@angular/core';
import { exit } from 'process';
import { Course } from '../common';
import { ICourse } from '../interfaces';
import { CourseStatus } from '../models';
import { RequirementType } from '../models/requirement.enum';
import { DepartmentService } from './department.service';

export interface IRequirement {
  type: RequirementType;
  required: number;
  papers?: string[];
  departments?: string[];
  faculties?: string[];
  pathways?: string[];
  modules?: string[];
  secondModules?: string[];
  conjoints?: string[];
  stage?: number;
  stages?: number[]; // combine with stage or abovestage?
  papersExcluded?: string[];
  departmentsExcluded?: string[];
  facultiesExcluded?: string[];
  isCorequesite?: boolean,
  aboveStage?: number;
  general?: boolean;
  flags?: string[];
  complex?: IRequirement[];
}

/*
 * Currently doing a course multiple times isn't handled?
 * I'm not sure what the correct response would be anyway
 *
 * General schedule is slightly more complicated
 * Each paper either has a faculty or is open
 * But it might be fine just putting an open faculty
 *
 * This seems pretty verbose at the moment
 * Trying to make a good string for each type of requirement isn't straightforward
 */

@Injectable()
export class RequirementService {

  private i = 0;

  constructor(private departmentService: DepartmentService) { }

  private intersection<T>(array1: T[], array2: T[]): T[] {
    if (array1 && array2) {
      return array1.filter((str: T) => array2.includes(str));
    } else {
      return [];
    }
  }

  /*
   * Some requirements give a range of papers like ANTHRO101-203,
   * This function tests whether 'checkIncluded' is in any of the reqs
   * Currently doesn't handle general papers because of the G at the end
   */
  public paperRangeIncludes(paperRange: string[], checkIncluded: string): boolean {
    for (const range of paperRange) {
      if (range.includes('-')) {
        const index = range.search(/[0-9]/);
        const dept = range.substring(0, index);
        const codes = range.substring(index);

        const index2 = checkIncluded.search(/[0-9]/);
        const dept2 = checkIncluded.substring(0, index2);
        const code2 = parseInt(checkIncluded.substring(index2), 10);

        const codeTerminals = codes.split('-'); // splits into start and end numbers
        if (dept === dept2 && code2 >= parseInt(codeTerminals[0], 10) && code2 <= parseInt(codeTerminals[1], 10)) {
          return true;
        }
      } else if (range === checkIncluded) {
        return true;
      }
    }
    return false;
  }

  public filterByRequirement(requirement: IRequirement, courses: ICourse[]): ICourse[] {
    let filtered = courses;
    /* Could refactor this further to just make an array of includes and excludes */
    const filters = [
      {check: requirement.papers,
        filter: (course: ICourse) => this.paperRangeIncludes(requirement.papers, course.name.toUpperCase())},
      {check: requirement.papersExcluded,
        filter: (course: ICourse) => !requirement.papersExcluded.includes(course.name.toUpperCase())},
      {check: requirement.faculties,
        filter: (course: ICourse) => this.intersection(requirement.faculties, course.faculties).length > 0},
      {check: requirement.facultiesExcluded,
        filter: (course: ICourse) => this.intersection(requirement.faculties, course.faculties).length === 0},
      {check: requirement.departments,
        filter: (course: ICourse) => requirement.departments.includes(course.department)},
      {check: requirement.departmentsExcluded,
        filter: (course: ICourse) => !requirement.departmentsExcluded.includes(course.department)},
      {check: this.checkFlag(requirement, 'general'),
        filter: (course: ICourse) => course.name.toUpperCase().substr(-1) === 'G'}, // -1 takes the last character
       {check: requirement.stage,
        filter: (course: ICourse) => requirement.stage === course.stage},
      {check: requirement.stages,
        filter: (course: ICourse) => requirement.stages.includes(course.stage)},
      {check: requirement.aboveStage,
        filter: (course: ICourse) => requirement.aboveStage < course.stage},
    ].filter((filter) =>
      !(filter.check === undefined || filter.check === false ||
        filter.check === null));

    // apply each of the filters in 'filters'
    filters.forEach((filter) => { filtered = filtered.filter(filter.filter)});
    return filtered;
  }

  public requirementCheck(requirement: IRequirement, planned: ICourse[]): number {
   //console.log(requirement)
    if (this.isComplex(requirement)) {
      let filled = requirement.complex.map((subRequirement: IRequirement) => this.requirementFilled(subRequirement, planned))
        .filter((tested: boolean) => tested).length;
      return Math.min(filled, requirement.required);
    }  else {
      let mapped;
      const filtered = this.filterByRequirement(requirement,
        planned.filter((course: ICourse) => course.status !== CourseStatus.Failed));
      const depts = new Set<string>();

      if (this.checkFlag(requirement, 'differentdepts')) {
        filtered.forEach((course: ICourse) => depts.add(course.department));
        return depts.size;
      }

      if (requirement.type === RequirementType.Points) {
        mapped = filtered.map((course: ICourse) => course.points);
      } else if (requirement.type === RequirementType.Papers) {
        mapped = filtered.map((course: ICourse) => 1);
      } else {
        //console.log('ERROR REQUIREMENT HAS TYPE ' + requirement.type);
      }

      if (this.checkFlag(requirement, 'isCorequesite')) {
        
        // console.log("Found: ", requirement.required)
         mapped = filtered.map((course: ICourse) => 1);
         //console.log("Found: ", mapped)
       }

      if (mapped != undefined || null) { // Make sure not undefined before assigning
      const total = mapped.reduce((num1: number, num2: number) => num1 + num2, 0);
      return total > requirement.required ? requirement.required : total;
      }
    }
  }

  public requirementFilled(requirement: IRequirement, planned: ICourse[]): boolean {
    if (this.isComplex(requirement)) {
      let filled = requirement.complex.map((subRequirement: IRequirement) => this.requirementFilled(subRequirement, planned))
        .filter((tested: boolean) => tested).length;
      // console.log(requirement);
      // console.log(filled + ' of ' + requirement.required);
      return filled >= requirement.required;
    }  else {
      return this.requirementCheck(requirement, planned) === requirement.required;
    }
  }

  // need to rework this to deal with certain rules
  // e.g. 3 different subjects faiils if given two different statuses
  public fulfilledByStatus(requirement: IRequirement, planned: ICourse[], status: CourseStatus): number {
    return this.requirementCheck(requirement, planned.filter((course: ICourse) => course.status === status));
  }

  public shortTitle(requirement: IRequirement) {
    if (this.isComplex(requirement)) {
      return 'Complex rule';
    }

    if (requirement.papers !== undefined) {
      if (requirement.papers.length <= 4 &&
        requirement.papers.filter((paper: string) => paper.includes('-')).length === 0) {
        return requirement.papers.join(', ');
      } else {
        // Change this to reflect the hyphenated rule
        return 'Compulsory papers';
      }
    }

    // This kind of looks insane, but it's a reasonably obvious pattern
    const str = requirement.required +
      (this.checkFlag(requirement, 'General') ? ' General' : '') +
      (requirement.type === RequirementType.Points ? ' points' : ' papers') +
      (requirement.stage !== undefined ? ' ' + requirement.stage + '00-level' : '') +
      (requirement.aboveStage !== undefined ? ' above ' + requirement.aboveStage + '00-level' : '') +
      (requirement.departments !== undefined ? ' from ' + requirement.departments.join(', ') : '') +
      (requirement.departmentsExcluded !== undefined ? ' outside ' + requirement.departments.join(', ') : '') +
      (this.checkFlag(requirement, 'DifferentDepts') ? ' of different subjects' : '') +
      (this.checkFlag(requirement, 'Major') ? ' from major' : '') +
      (this.checkFlag(requirement, 'MajorOne') ? ' from first major' : '') +
      (this.checkFlag(requirement, 'MajorTwo') ? ' from second major' : '') +
      (this.checkFlag(requirement, 'isCorequesite') ? ' as a co-requesite' : '') +
      (requirement.faculties !== undefined ? ' from ' + requirement.faculties.join(', ') : '') +
      (requirement.facultiesExcluded !== undefined ? ' outside ' + requirement.facultiesExcluded.join(', ') : '') +
      '';
    return str;
  }

  private isComplex(requirement: IRequirement) {
    return requirement.hasOwnProperty('complex');
  }

  /*
   * This will require some testing with real requirements, there's may be weird sounding possible strings
   */
  public toString(requirement: IRequirement, omitRequires: boolean) {

    if (this.isComplex(requirement)) {
      let complexString = omitRequires ? '' : 'Requires ';
      if (requirement.required === requirement.complex.length) {
        complexString = requirement.complex.map((req: IRequirement) => this.toString(req, true)).join(' and ');
      } else {
        if (requirement.required !== 1) {
          complexString += requirement.required + ' of: ';
        }
        complexString += requirement.complex.map((req: IRequirement) => this.toString(req, true)).join('; or ');
      }
      return complexString;
    }

    if (
      requirement.type === RequirementType.Papers &&
      requirement.papers !== undefined &&
      requirement.papers.length === requirement.required
    ) {
      if (this.checkFlag(requirement, "isCorequesite")) {
        return (
          (omitRequires ? "" : "Requires ") +
          requirement.papers.join(", ") +
          " as a co-requesite"
        );
      } else {
        return (
          (omitRequires ? "" : "Requires ") + requirement.papers.join(", ")
        );
      }
    }
    

    const str = (omitRequires ? '' : 'Requires ') + requirement.required +
      (requirement.type === RequirementType.Points ? ' points' : ' papers') +
      (requirement.papers !== undefined ? ' from ' + requirement.papers.join(', ') : '') +
      (requirement.papersExcluded !== undefined ? ' excluding ' + requirement.papersExcluded.join(', ') : '') +
      (requirement.stage !== undefined ? ' at ' + requirement.stage + '00-level' : '') +
      (requirement.aboveStage !== undefined ? ' above ' + requirement.aboveStage + '00-level' : '') +
      (requirement.departments !== undefined ? ' from ' + requirement.departments.join(', ') : '') +
      (requirement.departmentsExcluded !== undefined ? ' outside ' + requirement.departments.join(', ') : '') +
      (this.checkFlag(requirement, 'DifferentDepts') ? ' of different subjects' : '') +
      (this.checkFlag(requirement, 'Major') ? ' from major' : '') +
      (this.checkFlag(requirement, 'MajorOne') ? ' from first major' : '') +
      (this.checkFlag(requirement, 'MajorTwo') ? ' from second major' : '') +
      (requirement.faculties !== undefined ? ' from ' + requirement.faculties.join(', ') : '') +
      (requirement.facultiesExcluded !== undefined ? ' outside ' + requirement.facultiesExcluded.join(', ') : '') +
      (this.checkFlag(requirement, 'General') ? ' General schedule' : '') + '';
    return str;
  }

  public checkFlag(requirement: IRequirement, flag: string) {
    return requirement.flags !== undefined && requirement.flags[flag];
    // .map((str: string) => str.toLowerCase())
    // .includes(flag.toLowerCase());
  }

}
