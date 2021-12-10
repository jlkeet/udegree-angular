import { AnimationStyleMetadata } from '@angular/animations';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { ICourse } from './interfaces';
import {
  CourseModel,
  CourseStatus,
  Message,
  SemesterModel
} from './models';
import { IRequirement } from './services';

export interface State {
  courses: ICourse[];
  faculty: any;
  conjoint: any;
  majors: any[];
  secondMajors: any[];
  pathways: any[];
  majorSelected: boolean;
  minor: any;
  messages: Message[];
  semesters: any[];
  summerSchools: boolean[];
}

const defaultState = {
  courses: [],
  faculty: null,
  conjoint: null,
  majorSelected: false,
  majors: [null, null],
  secondMajors: [null, null],
  pathways: [null, null],
  messages: [],
  minor: null,
  page: false,
  semesters: [],
  slogan: 'Plan for Success',
  summerSchools: [false, false, false, false]
};

/**
 * @ngdoc service
 * @name Store
 * @description The store for our application.
 * Lightweight Reactive Store. We use RxJS Behaviour Subject to act Reactively
 *
 * ## Notes
 */

let _store = new BehaviorSubject<State>(defaultState);


@Injectable()
export class Store {
  private _store = _store;
  public changes: Observable<State> = this._store.asObservable().distinctUntilChanged();

  public setState(state: State) {
    this._store.next(state);
  }

  public getState(): State {
    return this._store.value;
  }

  public purge() {
    this._store.next(defaultState);
  }
}
