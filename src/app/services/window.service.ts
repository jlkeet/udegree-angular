import { Injectable } from '@angular/core';

function _window() : any {
   // return the global native browser window object
   return window;
}

/* 
    Allows us to inject native window into directives
*/    

@Injectable()
export class WindowRef {
   get nativeWindow() : any {
      return _window();
   }
}