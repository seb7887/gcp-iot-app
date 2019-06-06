import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';

const testEnv = functions();

// Firestore mock
const setStub = jest.fn();
const collection: any = jest.fn(() => {
  return {
    doc: jest.fn(() => {
      return {
        set: setStub
      };
    })
  };
});
const snapshot_ = jest.fn();

const firestore: any = () => {
  return {
    collection,
    snapshot_
  };
};

// BigQuery mock
const insert = jest.fn();
const table = jest.fn(() => ({ insert }));

const mockData = {
  humidity: 7,
  temperature: 11,
  deviceId: 'fake',
  timestamp: '2019-06-06'
};

jest.mock('@google-cloud/bigquery', () => {
  // tslint:disable-next-line: no-shadowed-variable
  const BigQuery = class {
    // tslint:disable-next-line: no-empty
    query() {}
    // tslint:disable-next-line: no-empty
    dataset() {}
  };
  BigQuery.prototype.query = jest.fn().mockResolvedValue([[mockData]]);
  BigQuery.prototype.dataset = jest.fn(() => ({ table }));
  return {
    BigQuery
  };
});

// Tests
describe('myFunctions', () => {
  let adminStub: any;
  let myFunctions: any;
  let consoleSpy: any;

  beforeAll(() => {
    //global.console.log = jest.fn();
    consoleSpy = jest.spyOn(global.console, 'log');
    adminStub = jest.spyOn(admin, 'initializeApp');
    Object.defineProperty(admin, 'firestore', {
      get: () => firestore
    });
    myFunctions = require('../src');
  });

  afterAll(() => {
    // clean things up
    jest.clearAllMocks();
    consoleSpy.mockRestore();
    adminStub.mockRestore();
    testEnv.cleanup();
  });

  /**
   * Batch functions
   */
  // PubSub triggered test
  it('receiveTelemetry: should store a MQTT message in Firestore and BigQuery', async () => {
    const data = {
      humidity: 7,
      temperature: 11
    };
    const message = testEnv.pubsub.makeMessage(data, {
      deviceId: 'fakeDevice'
    });
    const wrapped = testEnv.wrap(myFunctions.receiveTelemetry);
    await wrapped(message);

    expect(setStub).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledTimes(1);
  });

  // Firestore triggered function
  it('dbUpdate: should get triggered if a change is there is a change on Firestore database', () => {
    const path = '/devices/fake';
    const beforeSnap = testEnv.firestore.makeDocumentSnapshot(
      { foo: 'bar' },
      path
    );
    const afterSnap = testEnv.firestore.makeDocumentSnapshot(
      { foo: 'baz' },
      path
    );
    const change = testEnv.makeChange(beforeSnap, afterSnap);
    const wrapped = testEnv.wrap(myFunctions.dbUpdate);
    wrapped(change);
    expect(consoleSpy).toHaveBeenCalledTimes(1);
  });

  /**
   * HTTP functions
   */
  // HTTP triggered test
  it('getReportData: should get all BigQuery data', () => {
    const req = { headers: { origin: true } };
    const res = {};
    Object.assign(res, {
      setHeader: jest.fn(),
      getHeader: jest.fn(),
      status: (code: any) => {
        expect(code).toStrictEqual(200);
        return {
          json: (payload: any) => {
            expect(payload).toStrictEqual([mockData]);
          }
        };
      }
    });

    myFunctions.getReportData(req as any, res as any);
  });
});
