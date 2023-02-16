import helpers from './test-utils/test-helper';
describe('Token Validator', () => {
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
});
