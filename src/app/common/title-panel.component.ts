import { Component, Input } from '@angular/core';

@Component({
  selector: 'title-panel',
  styles: [`
    .title {
      width: 100%;
      background-color: #888;
      color: white;
      height: 55px;
      vertical-align: center;
      font-weight:1px;
      font: 500 20px/32px Roboto,"Helvetica Neue",sans-serif
    }
    .pad {
      padding: 10px;
    }
  `],
  template: `
  <div class="title">
    <div class="pad"> {{text}} </div>
  </div>`
})

export class TitlePanel {
  @Input() public textColor: string;
  @Input() public backgroundColor: string;
  @Input() public text: string;
}
