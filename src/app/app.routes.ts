import { RouterModule, Routes } from '@angular/router';
import { AddCourseContainer, PlannerContainer, SelectDegreeContainer, SelectMajorContainer } from './containers';
import { NoContent } from './no-content';

import { DataResolver } from './app.resolver';

import { LoginComponent } from './login/login.component';
import { UserComponent } from './user/user.component';
import { RegisterComponent } from './register/register.component';
import { UserResolver } from './user/user.resolver';
import { AuthGuard } from './core/auth.guard';


export const ROUTES: Routes = [
  { path: 'planner', component: PlannerContainer },
  { path: 'degree', component: SelectDegreeContainer },
  { path: 'major', component: SelectMajorContainer },
  { path: 'add', component: AddCourseContainer },
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [AuthGuard] },
  { path: 'user', component: UserComponent,  resolve: { data: UserResolver}},
  { path: '',      redirectTo: '/planner',  pathMatch: 'full' },
  { path: '**',    component: NoContent },


];
