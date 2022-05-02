export class PathwayService {
    public pathways;
  
    constructor() {
      this.pathways = require('../../assets/data/pathways.json');
    }
  
    public getPathways() {
      return this.pathways;
    }
  
    public pathwaysInDepartment(faculty) {
      return (this.pathways.filter((department) => faculty.pathways.includes(faculty.name)));
    }
  
    public allowedPaper() {
      return;
    }
  
    public checkFlag(pathway, flag: string): boolean {
      return pathway.flags.map((str: string) => str.toLowerCase()).includes(flag);
    }
  
  }
  