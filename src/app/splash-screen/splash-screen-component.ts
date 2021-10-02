import { Component, OnInit, Input } from "@angular/core";
import { SplashAnimationType } from "./splash-animation-type";

@Component({
  selector: "splash-screen",
  templateUrl: "./splash-screen-component.html",
  styleUrls: ["./splash-screen-component.scss"]
})
export class SplashScreenComponent implements OnInit {
  windowWidth: string;
  splashTransition: string;
  opacityChange: number = 1;
  showSplash = true;

  @Input() duration: number = 0.5;
  @Input() animationType: SplashAnimationType = SplashAnimationType.SlideLeft;

  ngOnInit(): void {
    setTimeout(() => {
      let transitionStyle = "";
      switch (this.animationType) {
        case SplashAnimationType.SlideLeft:
          this.windowWidth = "-" + window.innerWidth + "px";
          transitionStyle = "left " + this.duration + "s";
          break;
        case SplashAnimationType.SlideRight:
          this.windowWidth = window.innerWidth + "px";
          transitionStyle = "left " + this.splashTransition + "s";
          break;
        case SplashAnimationType.FadeOut:
          transitionStyle = "opacity " + this.splashTransition + "s";
          this.opacityChange = 0;
      }

      this.splashTransition = transitionStyle;

      //this.windowWidth = "-" + window.innerWidth + "px";
      setTimeout(() => {
        this.showSplash = !this.showSplash;
      }, this.duration * 1000);
    }, 2000);
  }
}