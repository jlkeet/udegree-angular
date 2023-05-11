import { Component, Input, OnChanges } from '@angular/core';
import { Item } from './explorer.component';

declare const require: any;

/*
  <svg class="line" class="svg">
    <line *ngFor="let line of .lines" [attr.x1]="getLine(l1, 0, 1)" [attr.y1]="getLine(line.l1, 0, 1)" [attr.x2]="getLine(line.l2, 1, 0)" [attr.y2]="getLine(line.l2, 1, 1)" stroke="blue"/>
  </svg>
 */

@Component({
  selector: 'app-item',
  template: `
      <div class="item noselect pointer"
        [ngClass]="{selected: item.selected}"
        class="item noselect pointer"
        (click)="select(item, i)"
        >
        {{item.title}}
      </div>
  `,
  styleUrls: [require("./item.component.css")],
})

export class ItemComponent implements OnChanges {
  @Input() item: Item;
  @Input() front: number;
  @Input() back: number;

  ngOnChanges() {
  }

  select() {
  }
}
