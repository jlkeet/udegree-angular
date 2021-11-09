export class ConjointService {
    private conjoints;
  
    constructor() {
      this.conjoints = require('../../assets/data/conjoints.json');
    }
  
    public getConjoints() {
      return this.conjoints;
    }
  
    public isPrescribed(conjoint): boolean {
      return this.checkFlag(conjoint, 'prescribed');
    }
  
    public allowsMinor(conjoint): boolean {
      return this.checkFlag(conjoint, 'mnr');
    }
  
    public allowsDoubleMajor(conjoint): boolean {
      return this.checkFlag(conjoint, 'dbl mjr');
    }
  
    private checkFlag(conjoint, flag: string): boolean {
      return conjoint.flags.map((str: string) => str.toLowerCase()).includes(flag);
    }
  
  }
  