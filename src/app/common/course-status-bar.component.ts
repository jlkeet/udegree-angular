import { Component, Input } from '@angular/core';
import { ICourse } from '../interfaces';
import { CourseStatus } from '../models';

/*
    A component for a displaying a status bar.
    Colour is based on status.
*/

@Component({
  selector: 'course-status-indicator',
  styles: [
    `
    .indicator {
        border-radius: 25px;
        width: 80px;
        height: 5px;
        position: absolute;
        left: 15px;
        top: 50px;
    }
    .indicator--failed{
        background: red;
    }
    .indicator--completed{
        background: #00ff00;
    }
    .indicator--enrolled{
        background: yellow;
    }
    .indicator--planned{
        background: white;
    }
    `
  ],
  template: `
     <div class='indicator' [ngClass]='indicatorClass'></div>
    `
})
export class CourseStatusBar {
  @Input() public course: ICourse;
  public indicatorClass: string;

  public ngOnInit() {
    switch (this.course.status) {
      case CourseStatus.Failed:
        this.indicatorClass = 'indicator--failed';
        return;
      case CourseStatus.Enrolled:
        this.indicatorClass = 'indicator--enrolled';
        return;
      case CourseStatus.Completed:
        this.indicatorClass = 'indicator--completed';
        return;
      case CourseStatus.Planned:
        this.indicatorClass = 'indicator--planned';
        return;
    }
  }
}
