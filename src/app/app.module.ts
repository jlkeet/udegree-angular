/* Angular */
import 'reflect-metadata'
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
  MatToolbarModule,
  MatFormFieldModule,
  MatTooltipModule,
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import {
  createInputTransfer,
  createNewHosts,
  removeNgStyles
} from '@angularclass/hmr';


/* Firebase */

// import { AngularFireModule} from '@angular/fire/compat'
// import { AngularFireDatabaseModule } from '@angular/fire/compat/database';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { FirebaseUserModel } from './core/user.model';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { environment } from '../environments/environment';
import { LoginComponent } from './login/login.component';
import { UserComponent } from './user/user.component';
import { RegisterComponent } from './register/register.component';
import { UserResolver } from './user/user.resolver';
import { AuthGuard } from './core/auth.guard';
import { AuthService } from './core/auth.service';
import { UserService } from './core/user.service';
import { ReactiveFormsModule } from '@angular/forms';

/* Third Party */
import { DragulaModule } from 'ng2-dragula';
import { DragulaService } from 'ng2-dragula';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxInfiniteScrollerModule } from 'ngx-infinite-scroller';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  DropdownModule,
  InputSwitchModule,
  MultiSelectModule
} from 'primeng/primeng';
import Html2canvas from 'html2canvas';

import { SplashScreenComponent } from './splash-screen/splash-screen-component';
import { AvatarModule, AvatarSource } from 'ngx-avatar';
import { MatExpansionModule } from '@angular/material/expansion';

/*
 * Platform and Environment providers/directives/pipes
 */

import { ROUTES } from './app.routes';
import { ENV_PROVIDERS } from '../environments/environment';

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

import { UserContainer } from './user/user-status.component';


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

const avatarSourcesOrder = [AvatarSource.FACEBOOK, AvatarSource.GOOGLE, AvatarSource.CUSTOM, AvatarSource.INITIALS];

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
    //common.UserContainer,

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
    NoContent,

    // Authentication
    LoginComponent,
    UserComponent,
    RegisterComponent,
    SplashScreenComponent,
    UserContainer,
    
  ],
  imports: [
    // import Angular's modules
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatButtonModule,
    MatOptionModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatToolbarModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatTooltipModule,
    NgbModule,
    NgxInfiniteScrollerModule,
    RouterModule.forRoot(ROUTES),
    DragulaModule,
    // PrimeNg Modules
    InputSwitchModule,
    MultiSelectModule,
    DropdownModule,
    // Firebase Authentication
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFirestoreModule, // firestore
    AngularFireAuthModule, // auth
    AngularFireStorageModule, // storage
    AvatarModule.forRoot({
      sourcePriorityOrder: avatarSourcesOrder
    }), // Avatar or Profile Pic
    MatExpansionModule,
  ],
  providers: [
    // expose our Services and Providers into Angular's dependency injection
    ENV_PROVIDERS,
    APP_PROVIDERS,
    AuthService,
    UserService,
    UserResolver,
    AuthGuard,
    DragulaService,
    WindowRef,
    FirebaseUserModel, // user data
    UserContainer,
    DegreeSelection,

    ...providers
  ]
})
export class AppModule {
 
}
