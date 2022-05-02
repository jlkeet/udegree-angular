import { enableDebugTools, disableDebugTools } from '@angular/platform-browser';
import { enableProdMode, ApplicationRef } from '@angular/core';

import { getAnalytics } from "firebase/analytics";

export const environment = {
  production: true,
  firebase: {
    apiKey: "AIzaSyB_-zvddGTVsnNhKj4rT10BSs6g_kU4PUE",
    authDomain: "udegree-angular.firebaseapp.com",
    databaseURL: "https://udegree-angular-courses-us-5d785.firebaseio.com/",
    projectId: "udegree-angular",
    storageBucket: "udegree-angular.appspot.com",
    messagingSenderId: "708718176430",
    appId: "1:708718176430:web:71ebdd7e688bd5f060253f",
    measurementId: "G-MN927X4H5S"
  },
  headTags: require('./head-config.common')
};



// Environment Providers
let PROVIDERS: any[] = [
  // common env directives
];

// Angular debug tools in the dev console
// https://github.com/angular/angular/blob/86405345b781a9dc2438c0fbe3e9409245647019/TOOLS_JS.md
let _decorateModuleRef = function identity<T>(value: T): T { return value; };

// if ('production' === ENV) {
  if (environment.production) {
  let  ENV = 'production';
  // Production
  disableDebugTools();
  enableProdMode();

  PROVIDERS = [
    ...PROVIDERS,
    // custom providers in production
  ];

} else {

  _decorateModuleRef = (modRef: any) => {
    const appRef = modRef.injector.get(ApplicationRef);
    const cmpRef = appRef.components[0];

    let _ng = (<any>window).ng;
    enableDebugTools(cmpRef);
    (<any>window).ng.probe = _ng.probe;
    (<any>window).ng.coreTokens = _ng.coreTokens;
    return modRef;
  };

  // Development
  PROVIDERS = [
    ...PROVIDERS,
    // custom providers in development
  ];

}

export const decorateModuleRef = _decorateModuleRef;

export const ENV_PROVIDERS = [
  ...PROVIDERS
];

