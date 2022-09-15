import { Component, Input, OnChanges, SimpleChange } from '@angular/core';
import { MatExpansionPanel } from '@angular/material';
import { RequirementService } from '../services';
import { ProgressPanelService } from '../services/progress-panel.service';
import { ProgressBarMultiContainer } from './progress-bar-multi.container';
// import { ProgressPanel } from './progress-panel.component';

export interface IBarState {
  color: string;
  value: number;
  full: boolean;
  index: number;
  majIndex: number;
}

@Component({
  selector: "progress-bar-multi",
  styles: [require("./progress-bar-multi.component.scss")],
  templateUrl: "./progress-bar-multi.template.html",
  viewProviders: [MatExpansionPanel],
})
export class ProgressBarMulti implements OnChanges {
  @Input() public isTotal: boolean; // true if this is the total progress bar
  @Input() public inactive: boolean; // if true the progress bar is greyed out counts do not update
  @Input() public isComplex: boolean;
  @Input() public max: number;
  @Input() public title: string;
  @Input() public hoverText: string; // text to show on hover over
  @Input() public barOne: IBarState;
  @Input() public barTwo: IBarState;
  @Input() public barThree: IBarState;
  @Input() public rule: string;
  @Input() public index: number;
  @Input() public majIndex: number;

  public states: any[];
  private total: number = 0;
  private percentage: number;
  private barOneWidth: number;
  private barTwoWidth: number;
  private barThreeWidth: number;
  private barThreeHeight: number;
  private showText: boolean = false;
  private barOneHoverText: string;
  private barTwoHoverText: string;
  private barThreeHoverText: string;
  private requirements = [];
  private combinedRule = [];

  private isDisabled = false;
  public degreeFullyPlanned = false;
  public majorFullyPlanned = false;

  constructor(
    private requirementService: RequirementService,
    private progressBarMultiContainer: ProgressBarMultiContainer,
    // private progressPanel: ProgressPanel,
    private progressPanelService: ProgressPanelService,
  ) {}

  public ngOnInit() {
    this.updatePercentage();
    this.updateProgress();
    this.updateTotal();
    this.barThree.index = this.index;
    this.barThree.majIndex = this.majIndex;

  }

  public ngOnChanges(changes: { [value: string]: SimpleChange }) {
    if (this.barThree.value === this.max) {
      this.barThree.full = true;
    } else {
      this.barThree.full = false;
    }
    if (this.barOne.value === this.max) {
      this.barOne.full = true;
    } else {
      this.barOne.full = false;
    }
    if (this.title === "Complex rule") {
      this.isComplex = true;
    } else {
      this.isComplex = false;
    }

    if (this.inactive) {
      return;
    }
    if (changes.barOne || changes.barTwo || changes.barThree) {
      this.updatePercentage();
      this.updateProgress();
      this.updateTotal();
      this.updateHelpText();
    }

    if (changes.max) {
      this.updatePercentage(changes.max.currentValue);
      this.updateProgress();
      this.updateTotal();
      this.updateHelpText();
    }

    this.degreeCheck();
    this.majorCheck();
  }

  private updatePercentage(max?: number) {
    if (max !== undefined) {
      this.percentage = Math.floor(
        ((this.barOne.value + this.barTwo.value + this.barThree.value) / max) *
          100
      ); // eslint-disable-line
    } else {
      this.percentage = this.calculatePercentage(
        this.barOne.value + this.barTwo.value + this.barThree.value
      ); // eslint-disable-line
    }
  }

  private updateProgress() {
    this.barOneWidth = this.calculatePercentage(this.barOne.value);
    this.barTwoWidth = this.calculatePercentage(
      this.barOne.value + this.barTwo.value
    );
    this.barThreeWidth = this.calculatePercentage(
      this.barOne.value + this.barTwo.value + this.barThree.value
    ); // eslint-disable-line
  }

  private updateTotal() {
    this.total = this.barOne.value + this.barTwo.value + this.barThree.value;
    this.total = this.total > this.max ? this.max : this.total;
  }

  private updateHelpText() {
    this.barOneHoverText = `${this.barOne.value} completed out of ${this.max}`;
    this.barTwoHoverText = `${this.barTwo.value} enrolled out of ${this.max}`;
    this.barThreeHoverText = `${this.barThree.value} planned out of ${this.max}`;
  }

  private onMouseOver() {
    this.showText = true;
  }

  private onMouseLeave() {
    this.showText = false;
  }

  private calculatePercentage(value: number) {
    const width = Math.floor((value / this.max) * 100);
    return width > 100 ? 100 : width;
  }

  private expansionOnClick() {
    this.requirements = this.requirementService.requirements;
    this.isDisabled = false;
    return this.isDisabled;
  }

  private noExpansionOnClick() {
    this.isDisabled = true;
    return this.isDisabled;
  }

  private populateCombined() {
    this.combinedRule = this.progressBarMultiContainer.combinedRule;
    for (let i = 0; i < this.combinedRule.length; i++) {
      //  this.max = this.combinedRule[i].complexMax;
    }
  }

  private newMax(newMax) {
    this.progressBarMultiContainer.max = newMax;
    this.max = newMax;
    //  this.progressBarMultiContainer.
  }

  private degreeCheck() {
    // let degreeCheckArray = this.progressPanelService.requirements.map(obj => ({...obj}));

    let degreeCheckArray = this.progressPanelService.requirements;
    let count = 0;
    for (let i = 0; i < this.progressPanelService.requirements.length; i++) {
      if (i === this.barThree.index) {
        if (degreeCheckArray[i].required === this.barThree.value) {
          degreeCheckArray[i].full = true;
        } else {
          degreeCheckArray[i].full = false;
        }
      }
    }
    for (let j = 0; j < degreeCheckArray.length; j++) {
      if (degreeCheckArray[j].full === true) {
        count++;
        // console.log(count)
      }
      if (count === this.progressPanelService.requirements.length) {
        this.progressPanelService.setFullyPlanned(true);
      } else {
        this.progressPanelService.setFullyPlanned(false);
      }
    }
  }

  private majorCheck() {
    let majorCheckArray = this.progressPanelService.majorRequirements;
    let majCount = 0;
    for (
      let i = 0;
      i < this.progressPanelService.majorRequirements.length;
      i++
    ) {
      // console.log(i , ' ', this.barThree.majIndex)
      if (i === this.barThree.majIndex) {
        if (majorCheckArray[i].required === this.barThree.value) {
          // console.log(majorCheckArray[i].required , ' ', this.barThree.value)
          majorCheckArray[i].full = true;
        } else {
          majorCheckArray[i].full = false;
        }
      }
    }

    for (let j = 0; j < majorCheckArray.length; j++) {
      // console.log(majorCheckArray[j])
      if (majorCheckArray[j] !== undefined) {
        if (majorCheckArray[j].full === true) {
          majCount++;
        }
        if (majCount === this.progressPanelService.majorRequirements.length) {
          this.progressPanelService.setMajorPlanned(true);
        } else {
          this.progressPanelService.setMajorPlanned(false);
        }
      }
    }
  }
}



  

