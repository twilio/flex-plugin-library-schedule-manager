import helpers from './test-utils/test-helper';
describe('Publish Function', () => {
  const mockFunctionValidatorObject = jest.fn();

  afterEach(() => {
    jest.resetModules();
  });

  beforeAll(() => {
    helpers.setup();
    global.Runtime._addFunction(
      'common/helpers/parameter-validator',
      './functions/common/helpers/parameter-validator.private.js',
    );
    global.Runtime._addFunction(
      'common/twilio-wrappers/retry-handler',
      './functions/common/twilio-wrappers/retry-handler.private.js',
    );
    global.Runtime._addFunction(
      'common/twilio-wrappers/serverless',
      './functions/common/twilio-wrappers/serverless.private.js',
    );
    jest.mock('twilio-flex-token-validator', function () {
      return {
        functionValidator: mockFunctionValidatorObject,
      };
    });
  });

  const context = {};
  const callback = jest.fn();
  const buildSid = 'test-build-sid';
  const TokenResult = { roles: ['admin'] };

  test('should return 400 if required parameters are missing', async () => {
    const event = {};
    mockFunctionValidatorObject.mockImplementation((fn) => {
      return fn;
    });
    const Publish = require('../functions/admin/publish');
    await Publish.handler(context, event, callback);

    expect(callback).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        _statusCode: 400,
        _body: expect.objectContaining({
          parameterError: expect.any(String),
        }),
      }),
    );
  });

  test('should return 403 if user does not have admin role', async () => {
    const event = { buildSid, TokenResult: { roles: [] } };
    mockFunctionValidatorObject.mockImplementation((fn) => {
      return fn;
    });
    const Publish = require('../functions/admin/publish');
    await Publish.handler(context, event, callback);

    expect(callback).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        _statusCode: 403,
        _body: 'Not authorized',
      }),
    );
  });

  test('should call ServerlessOperations.deployBuild and return the result', async () => {
    const result = { status: 200, message: 'Success' };
    mockFunctionValidatorObject.mockImplementation((fn) => {
      return fn;
    });

    jest.mock('../functions/common/twilio-wrappers/serverless.private', () => ({
      __esModule: true,
      deployBuild: () => {
        return { status: 200, message: 'Success' };
      },
    }));

    const event = { buildSid, TokenResult };
    const Publish = require('../functions/admin/publish');
    await Publish.handler(context, event, callback);

    expect(callback).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        _statusCode: result.status,
        _body: result,
      }),
    );
  });

  test('should return 500 if an error occurs', async () => {
    const error = new Error('Test error');
    mockFunctionValidatorObject.mockImplementation((fn) => {
      return fn;
    });

    jest.mock('../functions/common/twilio-wrappers/serverless.private', () => ({
      __esModule: true,
      deployBuild: jest.fn().mockRejectedValue(new Error('Test error')),
    }));

    const event = { buildSid, TokenResult };
    const Publish = require('../functions/admin/publish');
    await Publish.handler(context, event, callback);

    expect(callback).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        _statusCode: 500,
        _body: expect.objectContaining({
          message: error.message,
        }),
      }),
    );
  });
});
