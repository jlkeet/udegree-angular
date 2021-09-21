import { RouterModule, Routes } from '@angular/router';
import { AddCourseContainer, PlannerContainer, SelectDegreeContainer, SelectMajorContainer } from './containers';
import { NoContent } from './no-content';

import { DataResolver } from './app.resolver';

export const ROUTES: Routes = [
  { path: 'planner', component: PlannerContainer },
  { path: 'degree', component: SelectDegreeContainer },
  { path: 'major', component: SelectMajorContainer },
  { path: 'add', component: AddCourseContainer },
  { path: '',      redirectTo: 'planner',  pathMatch: 'full' },
  { path: '**',    component: NoContent }
];
