import {ApplicationState} from '../../src/shared/application-state';
import {initializePAL} from 'monterey-pal';

describe('ApplicationState object normalizer', () => {
  let applicationState: ApplicationState;

  beforeEach(() => {
    applicationState = new ApplicationState();
  });

  it('copies properties', () => {
    let normalized = <any>applicationState._normalize({
      a: 5,
      b: 'test'
    });

    expect(normalized.a).toBe(5);
    expect(normalized.b).toBe('test');
  });

  it('copies getter properties', () => {
    let obj = {};
    Object.defineProperty(obj, 'a', { get: function() { return 15; }, enumerable: true });
    let normalized = <any>applicationState._normalize(obj);

    expect(normalized.a).toBe(15);
  });

  it('handlers arrays', () => {
    let obj = {
      projects: [{
        a: 15
      }]
    };
    let normalized = <any>applicationState._normalize(obj);

    expect(normalized.projects[0].a).toBe(15);
  });

  it('handlers objects', () => {
    let obj = {
      something: {
        foo: 'bar'
      }
    };
    let normalized = <any>applicationState._normalize(obj);

    expect(normalized.something.foo).toBe('bar');
  });
});


describe('ApplicationState _loadStateFromSession', () => {
  let applicationState: ApplicationState;
  let session;
  let sessionState;

  beforeEach(() => {
    sessionState = {};
    session = {
      get: jasmine.createSpy('get').and.returnValue(sessionState)
    };
    initializePAL((_fs, _session) => Object.assign(_session, session));
    applicationState = new ApplicationState();
  });

  it('gets state from session and assigns properties to the ApplicationState', async (d) => {
    sessionState.foo = 'bar';
    sessionState.someObject = { bar: 'baz' };

    await applicationState._loadStateFromSession();

    expect((<any>applicationState).foo).toBe('bar');
    expect((<any>applicationState).someObject.bar).toBe('baz');

    d();
  });
});


describe('ApplicationState _isNew', () => {
  let applicationState: ApplicationState;
  let session;
  let sessionState;

  beforeEach(() => {
    sessionState = {};
    session = {
      has: jasmine.createSpy('has')
    };
    initializePAL((_fs, _session) => Object.assign(_session, session));
    applicationState = new ApplicationState();
  });

  it('returns whether or not there already is a state in session', async (d) => {
    session.has.and.returnValue(true);

    let isNew = await applicationState._isNew();

    expect(isNew).toBe(false);

    session.has.and.returnValue(false);

    isNew = await applicationState._isNew();

    expect(isNew).toBe(true);
    d();
  });
});



describe('ApplicationState _save', () => {
  let applicationState: ApplicationState;
  let session;
  let sessionState;

  beforeEach(() => {
    sessionState = {};
    session = {
      set: jasmine.createSpy('set')
    };
    initializePAL((_fs, _session) => Object.assign(_session, session));
    applicationState = new ApplicationState();
  });

  it('normalizes state object before persisting it to the session', async (d) => {
    let normalizeSpy = spyOn(applicationState, '_normalize');

    await applicationState._save();

    expect(normalizeSpy).toHaveBeenCalledWith(applicationState);
    d();
  });

  it('sets state property on session', async (d) => {
    let normalized = { foo: 'bar' };
    let normalizeSpy = spyOn(applicationState, '_normalize').and.returnValue(normalized);

    await applicationState._save();

    expect(session.set).toHaveBeenCalledWith('state', normalized);
    d();
  });
});
