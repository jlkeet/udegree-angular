import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ICourse } from '../interfaces';
import { CourseStatus, Period } from '../models';

// A service that allows us to communicate between courses panel (parent) and it's children
// (year,semester). The alternative would be to raise and consume a custom event on each
// component in the tree.
// See also: https://angular.io/docs/ts/latest/cookbook/component-communication.html#!#bidirectional-service

@Injectable()
export class CourseEventService {
  // Observable string sources
  private courseMovedSource = new Subject<MovedEvent>();
  private courseRemovedSource = new Subject<RemovedEvent>();
  private courseClickedSource = new Subject<ClickedEvent>();
  private courseStatusSource = new Subject<StatusEvent>();
  private errorsChangedSource = new Subject<ErrorsChangedEvent>();

  private longClickSource = new Subject<ClickedEvent>();

  // Observable string streams
  public courseMoved = this.courseMovedSource.asObservable();
  public courseRemoved = this.courseRemovedSource.asObservable();
  public courseClicked = this.courseClickedSource.asObservable();
  public courseStatus = this.courseStatusSource.asObservable();
  public errorsChanged = this.errorsChangedSource.asObservable();
  public longClick = this.longClickSource.asObservable();

  // Service message commands
  public raiseCourseMoved(event: MovedEvent) {
    this.courseMovedSource.next(event);
  }
  public raiseCourseRemoved(event: RemovedEvent) {
    this.courseRemovedSource.next(event);
  }

  public raiseCourseClicked(event: ClickedEvent) {
    this.courseClickedSource.next(event);
  }

  public raiseCourseStatus(event: StatusEvent) {
    this.courseStatusSource.next(event);
  }

  public raiseErrorsChanged(event: ErrorsChangedEvent) {
    this.errorsChangedSource.next(event);
  }

  public raiseLongCourseClicked(event: ClickedEvent) {
    this.longClickSource.next(event)
  }
}

// LIST OF EVENTS
export class ClickedEvent {
  public course: ICourse;
}
export class MovedEvent {
  public courseId: number;
  public period: Period;
  public year: number;
}
export class RemovedEvent {
  public courseId: number;
  public period: Period;
  public year: number;
}
export class StatusEvent {
  public courseId: number;
  public status: CourseStatus;
}
export class ErrorsChangedEvent {
  public errors: any[];
}