import { Component, Input, OnChanges, SimpleChange } from '@angular/core';

export interface IBarState {
  color: string;
  value: number;
}

@Component({
  selector: 'progress-bar-multi',
  // Our list of styles in our component. We may add more to compose many styles together
  styles: [require('./progress-bar-multi.component.scss')],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  // need to use rquire syntax to work with tests
  template: require('./progress-bar-multi.template.html')
})
export class ProgressBarMulti implements OnChanges {
  @Input() public isTotal: boolean; // true if this is the total progress bar
  @Input() public inactive: boolean; // if true the progress bar is greyed out counts do not update
  @Input() public max: number;
  @Input() public title: string;
  @Input() public hoverText: string; // text to show on hover over
  @Input() public barOne: IBarState;
  @Input() public barTwo: IBarState;
  @Input() public barThree: IBarState;

  public states: any[];
  private total: number = 0;
  private percentage: number;
  private barOneWidth: number;
  private barTwoWidth: number;
  private barThreeWidth: number;
  private showText: boolean = false;
  private barOneHoverText: string;
  private barTwoHoverText: string;
  private barThreeHoverText: string;

  public ngOnInit() {
    this.updatePercentage();
    this.updateProgress();
    this.updateTotal();
  }

  public ngOnChanges(changes: { [value: string]: SimpleChange }) {
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
  }

  private updatePercentage(max?: number) {
    if (max !== undefined) {
      this.percentage = Math.floor(
        (this.barOne.value + this.barTwo.value + this.barThree.value) /
          max *
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
    this.barThreeHoverText = `${this.barThree.value} planned out of ${
      this.max
    }`;
  }

  private onMouseOver() {
    this.showText = true;
  }

  private onMouseLeave() {
    this.showText = false;
  }

  private calculatePercentage(value: number) {
    const width = Math.floor(value / this.max * 100);
    return width > 100 ? 100 : width;
  }
}
