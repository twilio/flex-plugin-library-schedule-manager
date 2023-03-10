import helpers from './test-utils/test-helper';
describe('List Function', () => {
  const context = {
    SERVICE_SID: 'testServiceSid',
    getTwilioClient: jest.fn().mockReturnValue({
      serverless: {
        v1: {
          services: jest.fn().mockReturnValue({
            builds: {
              create: jest.fn().mockResolvedValue({
                sid: 'testBuildSid',
              }),
            },
            deployments: {
              list: jest.fn().mockResolvedValue({
                deployments: [
                  {
                    sid: 'testDeploymentSid',
                    build_sid: 'testBuildSid',
                  },
                ],
              }),
            },
          }),
        },
      },
    }),
  };

  const mockFunctionValidatorObject = jest.fn();

  afterEach(() => {
    jest.resetModules();
  });

  beforeAll(() => {
    helpers.setup();
    global.Runtime._addFunction(
      'common/helpers/schedule-utils',
      './functions/common/helpers/schedule-utils.private.js',
    );
    global.Runtime._addFunction(
      'common/twilio-wrappers/retry-handler',
      './functions/common/twilio-wrappers/retry-handler.private.js',
    );
    global.Runtime._addFunction(
      'common/twilio-wrappers/serverless',
      './functions/common/twilio-wrappers/serverless.private.js',
    );
    global.Runtime._addAsset('/config.json', '../assets/config.private.json');

    jest.mock('twilio-flex-token-validator', function () {
      return {
        functionValidator: mockFunctionValidatorObject,
      };
    });
  });

  test('fetchLatestBuild result fail', async () => {
    mockFunctionValidatorObject.mockImplementation((fn) => {
      return fn;
    });
    jest.mock('../functions/common/twilio-wrappers/serverless.private', () => ({
      __esModule: true,
      fetchLatestBuild: () => {
        return {
          success: false,
          status: 404,
          message: 'No build found',
        };
      },
      fetchLatestDeployment: () => {
        return {
          success: true,
          status: 200,
          latestDeployment: {
            path: '/config.json',
            buildSid: 'ConfigSID',
          },
        };
      },
    }));
    const List = require('../functions/admin/list');
    const event = {};
    const callback = jest.fn();
    const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS GET');
    response.appendHeader('Content-Type', 'application/json');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setStatusCode(404);
    const expected = response;

    await List.handler(context, event, callback);
    expect(callback.mock.calls[0][1]._statusCode).toEqual(expected._statusCode);
    expect(callback.mock.calls[0][1]._body.message).toEqual('No build found');
  });

  test('should return details successfully', async () => {
    mockFunctionValidatorObject.mockImplementation((fn) => {
      return fn;
    });
    jest.mock('../functions/common/twilio-wrappers/serverless.private', () => ({
      __esModule: true,
      fetchLatestBuild: () => {
        return {
          success: true,
          status: 200,
          latestBuild: {
            assetVersions: [
              {
                path: '/config.json',
                sid: 'ConfigSID',
              },
            ],
          },
        };
      },
      fetchLatestDeployment: () => {
        return {
          success: true,
          status: 200,
          latestDeployment: {
            path: '/config.json',
            buildSid: 'ConfigSID',
          },
        };
      },
    }));
    const List = require('../functions/admin/list');
    const event = {};
    const callback = jest.fn();
    const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS GET');
    response.appendHeader('Content-Type', 'application/json');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setStatusCode(200);
    const expected = response;

    await List.handler(context, event, callback);
    expect(callback.mock.calls[0][1]._statusCode).toEqual(expected._statusCode);
    expect(callback.mock.calls[0][1]._body.version).toEqual('ConfigSID');
  });

  test('error, no data asset in latest build', async () => {
    mockFunctionValidatorObject.mockImplementation((fn) => {
      return fn;
    });
    jest.mock('../functions/common/twilio-wrappers/serverless.private', () => ({
      __esModule: true,
      fetchLatestBuild: () => {
        return {
          success: true,
          status: 200,
          latestBuild: {
            assetVersions: [
              {
                path: '/configs.json',
                sid: 'ConfigSID',
              },
            ],
          },
        };
      },
      fetchLatestDeployment: () => {
        return {
          success: true,
          status: 200,
          latestDeployment: {
            path: '/config.json',
            buildSid: 'ConfigSID',
          },
        };
      },
    }));
    const List = require('../functions/admin/list');
    const event = {};
    const callback = jest.fn();

    await List.handler(context, event, callback);
    expect(callback.mock.calls[0][0]).toEqual('Missing asset in latest build');
  });

  test('latest deployment not successful', async () => {
    mockFunctionValidatorObject.mockImplementation((fn) => {
      return fn;
    });
    jest.mock('../functions/common/twilio-wrappers/serverless.private', () => ({
      __esModule: true,
      fetchLatestBuild: () => {
        return {
          success: true,
          status: 200,
          latestBuild: {
            assetVersions: [
              {
                path: '/config.json',
                sid: 'ConfigSID',
              },
            ],
          },
        };
      },
      fetchLatestDeployment: () => {
        return {
          success: false,
          status: 404,
          message: 'Could not find latest deployment',
        };
      },
    }));
    const List = require('../functions/admin/list');
    const event = {};
    const callback = jest.fn();

    const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS GET');
    response.appendHeader('Content-Type', 'application/json');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setStatusCode(404);
    const expected = response;

    await List.handler(context, event, callback);
    expect(callback.mock.calls[0][1]._statusCode).toEqual(expected._statusCode);
    expect(callback.mock.calls[0][1]._body.message).toEqual('Could not find latest deployment');
  });

  test('schedule utils throws error', async () => {
    mockFunctionValidatorObject.mockImplementation((fn) => {
      return fn;
    });
    jest.mock('../functions/common/twilio-wrappers/serverless.private', () => ({
      __esModule: true,
      fetchLatestBuild: () => {
        return {
          success: true,
          status: 200,
          latestBuild: {
            assetVersions: [
              {
                path: '/config.json',
                sid: 'ConfigSID',
              },
            ],
          },
        };
      },
      fetchLatestDeployment: () => {
        return {
          success: true,
          status: 200,
          latestDeployment: {
            path: '/config.json',
            buildSid: 'ConfigSID',
          },
        };
      },
    }));
    jest.mock('../functions/common/helpers/schedule-utils.private', () => ({
      __esModule: true,
      evaluateSchedule: () => {
        throw new Error('Eval Schedule Aborted');
      },
    }));
    const List = require('../functions/admin/list');
    const event = {};
    const callback = jest.fn();

    await List.handler(context, event, callback);
    expect(callback.mock.calls[0][0].toString()).toEqual('Error: Eval Schedule Aborted');
  });
});
