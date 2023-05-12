import { Injectable } from '@angular/core';
// import { ProgressBarMulti } from '../progress-panel/progress-bar-multi.component';
// import { ProgressPanel } from '../progress-panel/progress-panel.component';

@Injectable()
export class ProgressPanelService {
    public requirements;
    public degreeFullyPlanned;

    public majorRequirements;
    public majorFullyPlanned;
    public secondMajorRequirements;
    public thirdMajorRequirements;
    public pathwayRequirements;
    public moduleRequirements;
    public secondModuleRequirements;


    constructor() {

    }

    public setMajReqs(reqs) {
        this.majorRequirements = reqs;
    }

    public getMajReqs() {
        return this.majorRequirements;
    }

    public getSecondMajReqs() {
        return this.secondMajorRequirements
    }

    public setSecondMajReqs(reqs) {
        this.secondMajorRequirements = reqs;
    }

    public getThirdMajReqs() {
        return this.thirdMajorRequirements;
    }

    public setThirdMajReqs(reqs) {
        this.thirdMajorRequirements = reqs;
    }

    public getPathwayReqs() {
        return this.pathwayRequirements;
    }

    public setPathwayReqs(reqs) {
        this.pathwayRequirements = reqs;
    }

    public getModuleReqs() {
        return this.moduleRequirements;
    }

    public setModuleReqs(reqs) {
        this.moduleRequirements = reqs;
    }

    public getSecondModuleReqs() {
        return this.secondModuleRequirements;
    }

    public setSecondModuleReqs(reqs) {
        this.secondModuleRequirements = reqs;
    }

    public setMajorPlanned(majorFullyPlanned) {
        this.majorFullyPlanned = majorFullyPlanned
    }

    public getMajorFullyPlanned() {
        return this.majorFullyPlanned;
    }

    public setFullyPlanned(fullyPlanned) {
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
  