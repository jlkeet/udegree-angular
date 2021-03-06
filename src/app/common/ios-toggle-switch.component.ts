import { Component, Input, Output, EventEmitter } from '@angular/core';

/*
    A component for displaying an iOS style toggle.
*/

@Component({
    selector: 'toggle-switch',
    styles: [`
        .wrapper {
            max-width:300px;
            text-align:center;
        }

        input.toggle {
            max-height: 0;
            max-width: 0;
            opacity: 0;
        }

        input.toggle + label {
            display: inline-block;
            position: relative;
            box-shadow: inset 0 0 0px 1px #d5d5d5;
            text-indent: -5000px;
            height: 30px;
            width: 50px;
            border-radius: 15px;
        }

        input.toggle + label:before {
            content: "";
            position: absolute;
            display: block;
            height: 30px;
            width: 30px;
            top: 0;
            left: 0;
            border-radius: 15px;
            background: rgba(19,191,17,0);
            -moz-transition: .25s ease-in-out;
            -webkit-transition: .25s ease-in-out;
            transition: .25s ease-in-out;
        }

        input.toggle + label:after {
            content: "";
            position: absolute;
            display: block;
            height: 30px;
            width: 30px;
            top: 0;
            left: 0px;
            border-radius: 15px;
            background: white;
            box-shadow: inset 0 0 0 1px rgba(0,0,0,.2), 0 2px 4px rgba(0,0,0,.2);
            -moz-transition: .25s ease-in-out;
            -webkit-transition: .25s ease-in-out;
            transition: .25s ease-in-out;
        }

        input.toggle:checked + label:before {
            width: 50px;
            background: rgba(19,191,17,1);
        }

        input.toggle:checked + label:after {
            left: 20px;
            box-shadow: inset 0 0 0 1px rgba(19,191,17,1), 0 2px 4px rgba(0,0,0,.2);
        }
    `],
    template:
    `<span class="wrapper">
        <input type="checkbox" name="toggle" class="toggle" id="{{id}}" [(ngModel)]="checked"
        (ngModelChange)="onCheckChange()">
        <label for="{{id}}"></label>
    </span>`
})

export class ToggleSwitchComponent {
  @Output() public checkChange = new EventEmitter();
  @Input() public checked: boolean;
  @Input() public id: string;

  public onCheckChange() {
    this.checkChange.emit({
      value: this.checked
    });
  }
}
