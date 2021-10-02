import { Injectable } from '@angular/core';

function _location() : any {
   // return the global native browser location object
   return location;
}

/* 
    Allows us to inject native location into directives
*/    

@Injectable()
export class LocationRef {
   get location() : any {
      return _location();
   }
}