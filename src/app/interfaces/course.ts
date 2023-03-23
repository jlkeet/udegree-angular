import { CourseStatus, Period } from '../models';
import { IRequirement } from '../services';

export interface ICourse {
  id: number;
  generatedId?: number;
  name: string;
  title?: string;
  desc: string;
  faculties: string[];
  department: string[];
  status?: CourseStatus;
  period?: Period; // This is the period where the course is taken
  periods?: Period[]; // This is the periods where the course is offered
  year?: number; // this is used to identify where planned. Optional as will not be set initially
  isError?: boolean;
  // add more info for courses
  moreInfo?: string;
  coordinator?: string;
  assessment?: string;
  prescribedText?: string;
  recomendedText?: string;
  // optional help message
  help?: string;
  // when a course is selected in the add course dialog, we
  // need to close any other open course details panels,
  // we use this flag to that from the parent component
  selected?: boolean;
  disabled?: boolean;
  // sets whether the course can be delete
  canDelete?: boolean;
  // true if we should be show the add course button on details
  canAdd?: boolean;
  points?: number;
  stage?: number;
  requirements?: IRequirement[];
  grade?: number; // grade in GPA format
  isActive?: boolean; // Remove inactive courses from course list
  dragIt?: boolean; // To control dragability for touch devices
  general?: boolean;
}

// an idea - not used yet
// contains the details about a course
// this is the course information we display to the user
/*export interface ICourseData {
  id: string; // unique course identifier
  name: string; // name of the course e.g. BIOSCI201
  desc: string; // description of the course
  faculty: Faculty; // the faculty it belongs to
  dept: Department; // the dept it belongs to

  // this data is currently loaded from local storage
  moreInfo?: string;
  coordinator?: string;
  assessment?: string;
  prescribedText?: string;
  recomendedText?: string;
}*/
