import { Injectable } from '@angular/core';
// import { ProgressBarMulti } from '../progress-panel/progress-bar-multi.component';
// import { ProgressPanel } from '../progress-panel/progress-panel.component';

@Injectable()
export class ProgressPanelService {
    public requirements;
    public degreeFullyPlanned;

    public majorRequirements;
    public majorFullyPlanned;


    constructor() {

    }

    public setMajReqs(reqs) {
        this.majorRequirements = reqs;
    }

    public getMajReqs() {
        return this.majorRequirements;
    }

    public setMajorPlanned(majorFullyPlanned) {
        this.majorFullyPlanned = majorFullyPlanned
    }

    public getMajorFullyPlanned() {
        return this.majorFullyPlanned;
    }

    public setFullyPlanned(fullyPlanned) {
        // console.log(fullyPlanned)
        this.degreeFullyPlanned = fullyPlanned;
    }

    public getFullyPlanned() {
        return this.degreeFullyPlanned;
    }

    public setReqs(reqs) {
        this.requirements = reqs
    }

    public getReqs() {
        return this.requirements;
    }
  
  }
  