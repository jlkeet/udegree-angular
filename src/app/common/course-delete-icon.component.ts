import { Component, EventEmitter, Input, Output} from '@angular/core';

/*
    A component for a delete button on a course
*/

@Component({
    selector: 'course-delete-icon',
    styles: [`
    .course-delete-icon {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 15px;
        height: 15px;
        cursor:pointer;
        z-index:1;
    }
    `
    ],
    template: `
     <img
     (click)="deleteCourse($event)"
     src="assets/img/x.svg" alt="delete" class="course-delete-icon">
    `
})

export class CourseDeleteIcon  {

    @Input() public showDelete: boolean = true;
    @Output() public deleteCourseClicked = new EventEmitter();

    public deleteCourse(event) {
        if (!this.showDelete) {
          return;
        }
        event.stopImmediatePropagation();
        this.deleteCourseClicked.emit({});
    }
}
