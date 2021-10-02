/*
 * Angular bootstraping
 */
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { decorateModuleRef } from './environments/environment';
import { bootloader } from '@angularclass/hmr';
import { environment } from './environments/environment';

/*
 * App Module
 * our top level module that holds all of our components
 */
import { AppModule } from './app';
import { enableProdMode } from '@angular/core';

if (environment.production) {
  enableProdMode();
}

/*
 * Bootstrap our Angular app with a top level NgModule
 */
export function main(): Promise<any> {
  return platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .then(decorateModuleRef)
    .catch(err => console.error(err));
}

// needed for hmr
// in prod this is replace for document ready
bootloader(main);
