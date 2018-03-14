import { omit, createFeatureReducerFactory } from '../src/utils';
import { combineReducers, compose } from '@ngrx/store';

describe(`Store utils`, () => {
  describe(`combineReducers()`, () => {
    const state1 = { x: '' };
    const state2 = { y: '' };
    const reducer1 = (state = state1, action: any): typeof state1 =>
      action.type === 'state1' ? { ...state, x: action.payload } : state;
    const reducer2 = (state = state2, action: any): typeof state2 =>
      action.type === 'state2' ? { ...state, y: action.payload } : state;
    const reducers = { reducer1, reducer2, extraneous: true };
    const initialState = { reducer1: { x: 'foo' }, reducer2: { y: 'bar' } };

    let combination: any;

    beforeEach(() => {
      combination = combineReducers(reducers, initialState);
    });

    it(`should ignore extraneous keys`, () => {
      expect(combination(undefined, { type: '' }).extraneous).toBeUndefined();
    });

    it(`should create a function that accepts state and action and returns combined state object`, () => {
      const updateAction1 = { type: 'state1', payload: 'baz' };
      expect(combination(initialState, updateAction1)).toEqual({
        ...initialState,
        reducer1: { x: updateAction1.payload },
      });
    });

    it(`should handle initialState`, () => {
      expect(combination(undefined, { type: '' })).toEqual(initialState);
    });

    it(`should return original state if nothing changed`, () => {
      expect(combination(initialState, { type: '' })).toBe(initialState);
    });

    it(`should return full initial state of the root when action '@ngrx/store/update-reducers' is running with no initial state`, () => {
      const initialStateForReducer2Only = { reducer2: { y: 'bar' } };
      const combinationForReducer1 = combineReducers(
        { reducer1 } as any,
        initialStateForReducer2Only as any
      );
      const updateAction1 = { type: 'state1', payload: 'foo' };
      expect(combinationForReducer1(undefined, updateAction1)).toEqual({
        ...initialState,
        ...{ reducer2: { y: 'bar' } },
      });
    });
  });

  describe(`omit()`, () => {
    let originalObj: { x: string; y: string; z?: string };

    beforeEach(() => {
      originalObj = { x: 'foo', y: 'bar' };
    });

    it(`should omit a key passed`, () => {
      expect(omit(originalObj, 'x')).toEqual({ y: 'bar' });
    });

    it(`should not modify the original object`, () => {
      expect(omit(originalObj, 'y')).not.toBe(originalObj);
    });
  });

  describe(`compose()`, () => {
    const cube = (n: number) => Math.pow(n, 3);
    const precision = (n: number) => parseFloat(n.toPrecision(12));
    const addPtTwo = (n: number) => n + 0.2;

    it(`should compose functions`, () => {
      const addPrecision = compose(precision, addPtTwo);
      const addPrecisionCubed = compose(cube, addPrecision);

      expect(addPrecision(0.1)).toBe(0.3);
      expect(addPrecisionCubed(0.1)).toBe(0.027);
    });

    it(`should act as identity if no functions passed`, () => {
      const id = compose();
      expect(id(1)).toBe(1);
    });
  });

  describe('createFeatureReducerFactory()', () => {
    it('should compose a reducer factory from the provided meta reducers', () => {
      const metaReducer = jasmine
        .createSpy('metaReducer')
        .and.callFake(red => (s: any, a: any) => red(s, a));
      const reducer = (state: any, action: any) => state;

      const featureReducerFactory = createFeatureReducerFactory([metaReducer]);
      const initialState = 1;
      const featureReducer = featureReducerFactory(reducer, initialState);

      const state = featureReducer(undefined, <any>undefined);

      expect(metaReducer).toHaveBeenCalled();
      expect(state).toBe(initialState);
    });
  });
});
