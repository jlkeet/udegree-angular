import { Component } from '@angular/core';

@Component({
  selector: 'user-container',
  styles: [`
  .light {
    color:#ddd;
  }
  .circle {
    font-size:40px
  }
  .user{
    display:inline-block;
  }
  .name{
    font-size:15px;
    height:25px;
    margin:0px;
  }
  .email{
    font-size:10px;
    height:15px;
    margin-top:-10px;
  }
  .opensans {
    font-family: "Open Sans", sans-serif
  }
    `],
  template: `
  <span class="opensans">
    <span class="circle"> &#x25cb; </span>
      <span class="user">
      <div class="name">
        Harry Twyford &#x25be;
      </div>
      <div class="email">
        htwyford@gmail.com
      </div>
    </span>

    <span class="light"> | </span>
    &emsp;
    <notification-container></notification-container> 
    &emsp; &#x2699;
  </span>`
})
export class UserContainer {
}
