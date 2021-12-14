import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class AddCourseService {

  private toggleCourseSource = new Subject();
  private toggleDetailsSource = new Subject();
  public courseToggled = this.toggleCourseSource.asObservable();
  public detailsToggled = this.toggleDetailsSource.asObservable();

  public raiseCourseToggle(course) {
    this.toggleCourseSource.next(course);
  }

  public raiseDetailsToggled(course) {
    this.toggleDetailsSource.next(course);
  }
}
