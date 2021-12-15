import { Component, EventEmitter, Input, Output } from '@angular/core';

/*
    Displays a list of department tiles.
    In theory this could get way more complicated
    But it looks like UoA might've stopped minors altogether

    This should be reworked to give a bit more flexibility,
    It's currently very specific for two major, one minor

    Also needs a better styling
 */
@Component({
  selector: 'module-list',
  styleUrls: ['module-list.component.scss'],
  templateUrl: 'module-list.component.html',
})

export class PathwayList {
  @Output() public deptClicked = new EventEmitter();
  @Input() public majors;
  @Input() public departments: any[] = [];
  @Input() public faculty;
  @Input() public allowsMinor: boolean;
  @Input() public allowsDoubleMajor: boolean;
  @Input() public modules;


  // current major
  private cur = 0;
  private minor: string = null;

  private deleteDept(which) {
    if (which === 0) {
      this.modules[0] = this.modules[1];
      this.modules[1] = null;
      if (this.modules[0] === null) {
        this.cur = 0;
      }
    } else if (which === 1) {
      this.modules[1] = null;
    } else if (which === 2) {
      this.minor = null;
    }
    this.deptClicked.emit({
        modules: this.modules,
    });
  }

  // would be nice to split this up, but it's slightly awkward
  private clicked(module) {
    if ((this.cur === 0 && this.modules[1] !== module ||
      this.cur === 1 && this.modules[0] !== module)) {
      this.modules[this.cur] = module;
    } else if (this.cur === 2 && this.modules[0] !== module && this.modules[1] !== module) {
      this.minor = module;
    } else {
      return;
    }
    this.deptClicked.emit({
      modules: this.modules,
    });
  }

}
