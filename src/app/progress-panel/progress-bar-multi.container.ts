import { Component, Input, OnChanges, SimpleChange, EventEmitter } from "@angular/core";
import { Store } from "../app.store";
import { ICourse } from "../interfaces";
import { CourseStatus } from "../models";
import { RequirementService } from "../services";
import { IBarState } from "./progress-bar-multi.component";

@Component({
  selector: "progress-bar-multi-container",
  styles: [``],
  template: `
  <progress-bar-multi
    [title]="title"
    [max]="max"
    [barOne]="barOneState"
    [barTwo]="barTwoState"
    [barThree]="barThreeState"
    [isTotal]="isTotal"
    [hoverText]="hoverText"
  ></progress-bar-multi>
  `,
})

/*
 This component is the container for a progressbar. It is responsible for configuing the progress bar
 with the data it needs.
 I did trial writing one container per progress bar e.g. progress-bar-total.container, progress-bar-level-three
 But this led to a lot of classes that were virtually identical.
 Therefore settled for a generic container, where the differences (title, etc) and course filter are passed in.
 Courses are updated byt subscribing to the courses observable on the store.

 TODO: tests
*/
export class ProgressBarMultiContainer {
  @Input() public requirement;
  @Input() public courses;

  private hoverText: string | any[];
  private hoverTextComplex;
  private max: number;
  private title;
  private inactive: boolean = false;
  private barOneState: IBarState = { value: 0, color: "#66cc00" };
  private barTwoState: IBarState = { value: 0, color: "#f2d600" };
  private barThreeState: IBarState = { value: 0, color: "#66bbff" };
  private onPageChange = new EventEmitter<null>();
  private complexBool: boolean;

  constructor(
    private store: Store,
    private requirementService: RequirementService,
  ) {}

  public ngOnChanges() {
    this.updateState(this.courses);
  }

  public ngOnInit() {
    this.title = this.requirementService.shortTitle(this.requirement);
    this.hoverText = this.requirementService.toString(this.requirement, false);
    this.complexBool = false


  if (typeof this.hoverText !== 'string') {
    this.complexBool = true;
  //  console.log(this.hoverText)
     for (let i = 0; i < this.hoverText.length; i++) {
      //  console.log(i)
      //  this.hoverText = this.hoverText[i]
      this.hoverTextComplex = this.hoverText[i]
    //  console.log(this.hoverTextComplex)
      }
 //     console.log(this.hoverTextComplex)
  }
    this.max = this.requirement.required;
   
  }

  private updateState(courses: ICourse[]) {
    if (this.inactive) {
      return;
    }

    this.barOneState = this.getBarValue(
      this.barOneState,
      this.courses,
      CourseStatus.Completed
    );

    this.barTwoState = this.getBarValue(
      this.barTwoState,
      this.courses,
      CourseStatus.Enrolled
    );
    this.barThreeState = this.getBarValue(
      this.barThreeState,
      this.courses,
      CourseStatus.Planned
    );
  }

  private getBarValue(
    currentState: IBarState,
    courses: ICourse[],
    status: CourseStatus
  ) {
    if (courses === undefined || courses.length === 0) {
      return Object.assign({}, currentState, { value: 0 });
    }
    const value = this.requirementService.fulfilledByStatus(
      this.requirement,
      courses,
      status
    );
    return Object.assign({}, currentState, { value });
  }
}
