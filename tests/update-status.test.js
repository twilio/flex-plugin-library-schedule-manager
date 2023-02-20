import helpers from './test-utils/test-helper';

describe('updateStatus', () => {
  const mockFunctionValidatorObject = jest.fn();

  const mockContext = {};
  const mockEvent = {};
  const mockCallback = jest.fn();

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

  test('should return a 400 error when required parameters are missing', async () => {
    mockFunctionValidatorObject.mockImplementation((fn) => {
      return fn;
    });
    // Set up the mock for ParameterValidator
    jest.mock('../functions/common/helpers/parameter-validator.private', () => ({
      __esModule: true,
      validate: () => {
        return 'Missing required parameters: buildSid';
      },
    }));

    // Call the handler function
    const UpdateStatus = require('../functions/admin/update-status');
    await UpdateStatus.handler(mockContext, { ...mockEvent, buildSid: undefined }, mockCallback);

    // Check that the response has the expected status code and _body
    expect(mockCallback).toHaveBeenCalledWith(null, {
      _statusCode: 400,
      _body: { parameterError: 'Missing required parameters: buildSid' },
      _headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS POST',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  });

  test('should return a 403 error when user is not authorized', async () => {
    mockFunctionValidatorObject.mockImplementation((fn) => {
      return fn;
    });
    jest.mock('../functions/common/helpers/parameter-validator.private', () => ({
      __esModule: true,
      validate: () => {
        return '';
      },
    }));
    // Call the handler function with a TokenResult that does not contain the 'admin' role
    const UpdateStatus = require('../functions/admin/update-status');
    await UpdateStatus.handler(
      mockContext,
      { ...mockEvent, buildSid: 'BuildSid', TokenResult: { roles: ['agent'] } },
      mockCallback,
    );

    // Check that the response has the expected status code and _body
    expect(mockCallback).toHaveBeenCalledWith(null, {
      _statusCode: 403,
      _body: 'Not authorized',
      _headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS POST',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  });

  test('returns status successfully', async () => {
    mockFunctionValidatorObject.mockImplementation((fn) => {
      return fn;
    });
    jest.mock('../functions/common/helpers/parameter-validator.private', () => ({
      __esModule: true,
      validate: () => {
        return '';
      },
    }));
    jest.mock('../functions/common/twilio-wrappers/serverless.private', () => ({
      __esModule: true,
      fetchBuildStatus: () => {
        return { status: 200, message: 'Build status fetched successfully' };
      },
    }));
    const UpdateStatus = require('../functions/admin/update-status');
    await UpdateStatus.handler(
      mockContext,
      { ...mockEvent, buildSid: 'BuildSid', TokenResult: { roles: ['admin'] } },
      mockCallback,
    );

    // Check that the response has the expected status code and _body
    expect(mockCallback).toHaveBeenCalledWith(null, {
      _statusCode: 200,
      _body: {
        message: 'Build status fetched successfully',
        status: 200,
      },
      _headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS POST',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  });

  test('fetch build status fails', async () => {
    mockFunctionValidatorObject.mockImplementation((fn) => {
      return fn;
    });
    const error = new Error('Catastrophic Failure');
    jest.mock('../functions/common/helpers/parameter-validator.private', () => ({
      __esModule: true,
      validate: () => {
        return '';
      },
    }));
    jest.mock('../functions/common/twilio-wrappers/serverless.private', () => ({
      __esModule: true,
      fetchBuildStatus: () => {
        throw new Error('Catastrophic Failure');;
      },
    }));
    const UpdateStatus = require('../functions/admin/update-status');
    await UpdateStatus.handler(
      mockContext,
      { ...mockEvent, buildSid: 'BuildSid', TokenResult: { roles: ['admin'] } },
      mockCallback,
    );

    // Check that the response has the expected status code and _body
    expect(mockCallback).toHaveBeenCalledWith(error);
  });
});
