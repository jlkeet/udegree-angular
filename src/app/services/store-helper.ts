import { Injectable } from '@angular/core';
import { Store } from '../app.store';

/**
 * @ngdoc service
 * @name StoreHelper
 * @description Helper class to ensure we always pass new refernced to the store.
 *
 * ## Notes
 * This is because we are using asObservable().distinctUntilChanged()
 * See: https://www.learnrxjs.io/operators/filtering/distinctuntilchanged.html
 */
@Injectable()
export class StoreHelper {
  constructor(private store: Store) {}

  public update(prop, state) {
    const currentState = this.store.getState();
    this.store.setState(Object.assign({}, currentState, { [prop]: state }));
  }

  public current(prop) {
    const currentState = this.store.getState();
    return currentState[prop];
  }

  public add(prop, state) {
    const currentState = this.store.getState();
    const collection = currentState[prop];
    this.store.setState(
      Object.assign({}, currentState, { [prop]: [...collection, state] })
    );
  }

  public addIfNotExists(prop, state) {
    const currentState = this.store.getState();
    const collection = currentState[prop];

    const index = collection.findIndex((item) => {
      return item.id === state.id;
    });

    if (index < 0) {
      this.store.setState(
        Object.assign({}, currentState, { [prop]: [...collection, state] })
      );
    }
  }

  public findAndUpdate(prop, state) {
    const currentState = this.store.getState();
    const collection = currentState[prop];

    this.store.setState(
      Object.assign({}, currentState, {
        [prop]: collection.map((item) => {
          // skip if this is not the droid we are looking for
          if (item.id !== state.id) {
            return item;
          }
          // if it is, update it
          return Object.assign({}, item, state);
        })
      })
    );
  }

  public findAndDelete(prop, id) {
    const currentState = this.store.getState();
    const collection = currentState[prop];
    this.store.setState(
      Object.assign({}, currentState, {
        [prop]: collection.filter((item) => item.id !== id)
      })
    );
  }

  public deleteAll() {
    this.store.purge()
  }

}
