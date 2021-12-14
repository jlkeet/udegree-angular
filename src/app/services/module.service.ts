import { Injectable } from '@angular/core';
import { CourseService } from './courses';
import { ICourse } from '../interfaces';

@Injectable()
export class ModuleService {

// 	private allModules;

// 	constructor(courseService: CourseService) {
// 		const modules = require('../../assets/data/modules.json');
// 		this.allModules = modules.map((mod) => {
// 			return { name: mod.name, courses: mod.courses
// 				.map((course: string) => courseService.stringToCourse(course)
// 				)};
// 			});
// 	}

// 	public getModules() {
// 		return this.allModules;
// 	}
// }

// interface Module {
// 	name: string,
// 	courses: ICourse[]
// }

    private modules;
  
    constructor() {
      this.modules = require('../../assets/data/modules.json');
    }
  
    public getModules() {
      return this.modules;
    }
  
    public allowedPaper() {
      return;
    }
  
    private checkFlag(modules, flag: string): boolean {
      return modules.flags.map((str: string) => str.toLowerCase()).includes(flag);
    }
  
  }
  