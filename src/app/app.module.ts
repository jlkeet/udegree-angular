/* Angular */
import { HttpClientModule } from '@angular/common/http';
import { ApplicationRef, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatInputModule,
  MatOptionModule,
  MatSelectModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatToolbarModule
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import {
  createInputTransfer,
  createNewHosts,
  removeNgStyles
} from '@angularclass/hmr';

/* Third Party */
import { DragulaModule } from 'ng2-dragula';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxInfiniteScrollerModule } from 'ngx-infinite-scroller';
import {
  DropdownModule,
  InputSwitchModule,
  MultiSelectModule
} from 'primeng/primeng';

/*
 * Platform and Environment providers/directives/pipes
 */

import { ROUTES } from './app.routes';
import { ENV_PROVIDERS } from './environment';

/* App */
import {
  AddCoursePanel,
  AddCourseService,
  CourseCard,
  CourseFilter
} from './add-course';
import { App, providers } from './app.component';
import { AppHeader } from './app.header.component';
import { AppReadyEvent } from './app.ready.event';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import { AppState, InteralStateType } from './app.service';
import { Store } from './app.store';
import * as common from './common';
import {
  AddCourseContainer,
  LeftPanelContainer,
  NotificationContainer,
  PlannerContainer,
  SelectDegreeContainer,
  SelectMajorContainer
} from './containers';
import {
  CoursesPanel,
  SemesterPanel
} from './courses-panel';
import { NoContent } from './no-content';
import * as progress from './progress-panel';
import { DegreeSelection, DepartmentList, FacultyList } from './select-major';
import { CourseService, WindowRef } from './services';

// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  Store,
  AppState,
  AppReadyEvent
];

type StoreType = {
  state: InteralStateType;
  restoreInputValues: () => void;
  disposeOldHosts: () => void;
};

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [App],
  declarations: [
    App,
    AppHeader,
    common.NotificationIconComponent,
    common.NotificationListComponent,
    common.NotificationComponent,
    common.ToggleSwitchComponent,
    common.TitlePanel,
    common.UserContainer,

    AddCourseContainer,
    CourseCard,
    CourseFilter,

    NotificationContainer,
    PlannerContainer,
    SelectDegreeContainer,
    SelectMajorContainer,

    LeftPanelContainer,

    common.CourseStatusBar,
    common.Course,
    common.CourseDetails,
    common.CourseDraggable,
    common.CourseDeleteIcon,
    AddCoursePanel,
    // Progress panel
    progress.ProgressPanel,
    progress.ProgressWidthDirective,
    progress.ProgressBarMulti,
    progress.ProgressBarMultiContainer,
    CoursesPanel,
    SemesterPanel,

    DegreeSelection,
    FacultyList,
    DepartmentList,
    NoContent
  ],
  imports: [
    // import Angular's modules
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatOptionModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatToolbarModule,
    MatSidenavModule,
    NgxInfiniteScrollerModule,
    RouterModule.forRoot(ROUTES),
    DragulaModule,
    // PrimeNg Modules
    InputSwitchModule,
    MultiSelectModule,
    DropdownModule
  ],
  providers: [
    // expose our Services and Providers into Angular's dependency injection
    ENV_PROVIDERS,
    APP_PROVIDERS,
    DragulaService,
    WindowRef,
    ...providers
  ]
})
export class AppModule {
  constructor(public appRef: ApplicationRef, public appState: AppState) {}

  hmrOnInit(store: StoreType) {
    if (!store || !store.state) return;
    console.log('HMR store', JSON.stringify(store, null, 2));
    // set state
    this.appState._state = store.state;
    // set input values
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues;
      setTimeout(restoreInputValues);
    }

    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

  hmrOnDestroy(store: StoreType) {
    const cmpLocation = this.appRef.components.map(
      cmp => cmp.location.nativeElement
    );
    // save state
    const state = this.appState._state;
    store.state = state;
    // recreate root elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // save input values
    store.restoreInputValues = createInputTransfer();
    // remove styles
    removeNgStyles();
  }

  hmrAfterDestroy(store: StoreType) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }
}
