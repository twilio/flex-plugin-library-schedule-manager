import helpers from './test-utils/test-helper';

const createDeploymentTwilioClient = {
  serverless: {
    v1: {
      services: () => {
        return {
          environments: () => {
            return {
              deployments: {
                create: () => {
                  return { sid: 'deployedSid' };
                },
              },
            };
          },
        };
      },
    },
  },
};
const fetchBuildStatusTwilioClient = {
  serverless: {
    v1: {
      services: () => {
        return {
          builds: () => {
            return {
              buildStatus: () => {
                return {
                  fetch: () => {
                    return { status: 'buildDone' };
                  },
                };
              },
            };
          },
        };
      },
    },
  },
};
const fetchLatestBuildTwilioClient = {
  serverless: {
    v1: {
      services: () => {
        return {
          builds: {
            list: () => {
              return [
                {
                  buildInfo: 'no ragrets',
                },
              ];
            },
          },
        };
      },
    },
  },
};

describe('Test functions in serverless', () => {
  describe('deployBuild()', () => {
    beforeAll(() => {
      helpers.setup();
      global.Runtime._addFunction(
        'common/twilio-wrappers/retry-handler',
        './functions/common/twilio-wrappers/retry-handler.private.js',
      );
      jest.mock('../functions/common/twilio-wrappers/retry-handler.private', () => ({
        __esModule: true,
        retryHandler: () => {},
      }));
    });
    const validParams = {
      scriptName: 'testScript',
      attempts: 1,
      context: {
        getTwilioClient: () => {
          return createDeploymentTwilioClient;
        },
        ENVIRONMENT_SID: 'testEnvSid',
        SERVICE_SID: 'testServiceSid',
      },
      buildSid: 'testBuildSid',
    };
    const invalidParams = {
      scriptName: '',
      attempts: 1,
      context: {
        getTwilioClient: () => {},
        ENVIRONMENT_SID: 'testEnvSid',
        SERVICE_SID: 'testServiceSid',
      },
      buildSid: 'testBuildSid',
    };

    test('should return an object with success and deploymentSid properties', async () => {
      const Serverless = require('../functions/common/twilio-wrappers/serverless.private');
      const result = await Serverless.deployBuild(validParams);
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('deploymentSid');
    });

    test('should throw an error when given invalid parameters', async () => {
      const Serverless = require('../functions/common/twilio-wrappers/serverless.private');
      await expect(Serverless.deployBuild({ ...invalidParams, scriptName: 1 })).rejects.toEqual(
        'Invalid parameters object passed. Parameters must contain scriptName of calling function',
      );
    });

    test('should throw an error when given invalid parameters - scriptName', async () => {
      const Serverless = require('../functions/common/twilio-wrappers/serverless.private');
      await expect(
        Serverless.deployBuild({
          ...invalidParams,
          scriptName: 12,
        }),
      ).rejects.toEqual('Invalid parameters object passed. Parameters must contain scriptName of calling function');
    });

    test('should throw an error when given invalid parameters - attempts', async () => {
      const Serverless = require('../functions/common/twilio-wrappers/serverless.private');
      await expect(
        Serverless.deployBuild({
          ...invalidParams,
          attempts: 'hello',
        }),
      ).rejects.toEqual('Invalid parameters object passed. Parameters must contain the number of attempts');
    });

    test('should throw an error when given invalid parameters - context', async () => {
      const Serverless = require('../functions/common/twilio-wrappers/serverless.private');
      await expect(
        Serverless.deployBuild({
          ...invalidParams,
          context: 'hello',
        }),
      ).rejects.toEqual('Invalid parameters object passed. Parameters must contain context object');
    });

    test('should throw an error when given invalid parameters - buildSid', async () => {
      const Serverless = require('../functions/common/twilio-wrappers/serverless.private');
      await expect(
        Serverless.deployBuild({
          ...invalidParams,
          buildSid: 12,
        }),
      ).rejects.toEqual('Invalid parameters object passed. Parameters must contain buildSid string');
    });
  });
});

describe('fetchBuildStatus()', () => {
  beforeAll(() => {
    helpers.setup();
    global.Runtime._addFunction(
      'common/twilio-wrappers/retry-handler',
      './functions/common/twilio-wrappers/retry-handler.private.js',
    );
  });
  jest.mock('../functions/common/twilio-wrappers/retry-handler.private', () => ({
    __esModule: true,
    retryHandler: () => {},
  }));
  const validParams = {
    scriptName: 'testScript',
    attempts: 1,
    context: {
      getTwilioClient: () => {
        return fetchBuildStatusTwilioClient;
      },
      SERVICE_SID: 'testServiceSid',
    },
    buildSid: 'testBuildSid',
  };
  const invalidParams = {
    scriptName: 12,
    attempts: 1,
    context: {
      getTwilioClient: () => {
        return fetchBuildStatusTwilioClient;
      },
      SERVICE_SID: 'testServiceSid',
    },
    buildSid: 'testBuildSid',
  };

  test('should return an object with success and buildStatus properties', async () => {
    const Serverless = require('../functions/common/twilio-wrappers/serverless.private');
    const result = await Serverless.fetchBuildStatus(validParams);
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('buildStatus');
  });

  test('should throw an error when given invalid parameters', async () => {
    const Serverless = require('../functions/common/twilio-wrappers/serverless.private');
    expect(Serverless.fetchBuildStatus(invalidParams)).rejects.toEqual(
      'Invalid parameters object passed. Parameters must contain scriptName of calling function',
    );
  });

  test('should throw an error when given invalid parameters - attempts', async () => {
    const Serverless = require('../functions/common/twilio-wrappers/serverless.private');
    await expect(
      Serverless.fetchBuildStatus({
        ...invalidParams,
        attempts: 'hello',
      }),
    ).rejects.toEqual('Invalid parameters object passed. Parameters must contain scriptName of calling function');
  });

  test('should throw an error when given invalid parameters - context', async () => {
    const Serverless = require('../functions/common/twilio-wrappers/serverless.private');
    await expect(
      Serverless.fetchBuildStatus({
        ...invalidParams,
        context: 'hello',
      }),
    ).rejects.toEqual('Invalid parameters object passed. Parameters must contain scriptName of calling function');
  });

  test('should throw an error when given invalid parameters - buildSid', async () => {
    const Serverless = require('../functions/common/twilio-wrappers/serverless.private');
    await expect(
      Serverless.fetchBuildStatus({
        ...invalidParams,
        buildSid: 12,
      }),
    ).rejects.toEqual('Invalid parameters object passed. Parameters must contain scriptName of calling function');
  });
});

describe('fetchLatestBuild()', () => {
  beforeAll(() => {
    helpers.setup();
    global.Runtime._addFunction(
      'common/twilio-wrappers/retry-handler',
      './functions/common/twilio-wrappers/retry-handler.private.js',
    );
    jest.mock('../functions/common/twilio-wrappers/retry-handler.private', () => ({
      __esModule: true,
      retryHandler: () => {},
    }));
  });
  const validParams = {
    scriptName: 'testScript',
    attempts: 1,
    context: {
      getTwilioClient: () => {
        return fetchLatestBuildTwilioClient;
      },
      SERVICE_SID: 'testServiceSid',
    },
  };
  const invalidParams = {
    scriptName: '',
    attempts: 1,
    context: {
      getTwilioClient: () => {},
      SERVICE_SID: 'testServiceSid',
    },
  };

  test('should return an object with success and latestBuild properties', async () => {
    const Serverless = require('../functions/common/twilio-wrappers/serverless.private');
    const result = await Serverless.fetchLatestBuild(validParams);
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('latestBuild');
  });

  test('should throw an error when there are no builds', async () => {
    const noBuildParams = {
      ...validParams,
      context: { ...validParams.context, SERVICE_SID: 'testServiceSidNoBuilds' },
    };
    const Serverless = require('../functions/common/twilio-wrappers/serverless.private');

    await expect(Serverless.fetchLatestBuild(noBuildParams)).rejects;
  });

  test('should throw an error when given invalid parameters', async () => {
    const Serverless = require('../functions/common/twilio-wrappers/serverless.private');
    await expect(Serverless.fetchLatestBuild(invalidParams)).rejects;
  });
});

describe('fetchLatestDeployment()', () => {
  beforeAll(() => {
    helpers.setup();
    global.Runtime._addFunction(
      'common/twilio-wrappers/retry-handler',
      './functions/common/twilio-wrappers/retry-handler.private.js',
    );
    jest.mock('../functions/common/twilio-wrappers/retry-handler.private', () => ({
      __esModule: true,
      retryHandler: () => {},
    }));
  });
  const context = {
    getTwilioClient: jest.fn().mockReturnValue({
      serverless: {
        v1: {
          services: jest.fn().mockReturnValue({
            environments: jest.fn().mockReturnValue({
              deployments: {
                list: jest.fn().mockResolvedValue([{ sid: 'deployment-sid' }]),
              },
            }),
          }),
        },
      },
    }),
    SERVICE_SID: 'service-sid',
    ENVIRONMENT_SID: 'environment-sid',
  };
  const parameters = {
    scriptName: 'test-script',
    attempts: 1,
    context,
  };

  test('should throw if scriptName is not a string', async () => {
    const Serverless = require('../functions/common/twilio-wrappers/serverless.private');
    const invalidParams = { ...parameters, scriptName: null };
    await expect(Serverless.fetchLatestDeployment(invalidParams)).rejects.toEqual(
      'Invalid parameters object passed. Parameters must contain scriptName of calling function',
    );
  });

  test('should throw if attempts is not a number', async () => {
    const invalidParams = { ...parameters, attempts: 'not a number' };
    const Serverless = require('../functions/common/twilio-wrappers/serverless.private');
    await expect(Serverless.fetchLatestDeployment(invalidParams)).rejects.toEqual(
      'Invalid parameters object passed. Parameters must contain the number of attempts',
    );
  });

  test('should throw if context is not an object', async () => {
    const invalidParams = { ...parameters, context: 'not an object' };
    const Serverless = require('../functions/common/twilio-wrappers/serverless.private');
    await expect(Serverless.fetchLatestDeployment(invalidParams)).rejects.toEqual(
      'Invalid parameters object passed. Parameters must contain context object',
    );
  });

  test('should fetch the latest deployment', async () => {
    const Serverless = require('../functions/common/twilio-wrappers/serverless.private');
    const result = await Serverless.fetchLatestDeployment(parameters);
    expect(result).toEqual({ success: true, status: 200, latestDeployment: { sid: 'deployment-sid' } });
  });

  test('should return an error if no deployments are found', async () => {
    context.getTwilioClient.mockReturnValueOnce({
      serverless: {
        v1: {
          services: jest.fn().mockReturnValue({
            environments: jest.fn().mockReturnValue({
              deployments: {
                list: jest.fn().mockResolvedValue([]),
              },
            }),
          }),
        },
      },
    });

    const Serverless = require('../functions/common/twilio-wrappers/serverless.private');
    const result = await Serverless.fetchLatestDeployment(parameters);
    expect(result).toEqual({ success: false, status: 400, message: 'No deployments found' });
  });

  it('getEnv should return empty string if TWILIO_REGION is not set', () => {
    const context = {};
    const Serverless = require('../functions/common/twilio-wrappers/serverless.private');
    const env = Serverless.getEnv(context);
    expect(env).toEqual('');
  });

  it('getEnv should return env if TWILIO_REGION is set', () => {
    const context = { TWILIO_REGION: 'stage-us1' };
    const Serverless = require('../functions/common/twilio-wrappers/serverless.private');
    const env = Serverless.getEnv(context);
    expect(env).toEqual('stage');
  });

  it('should return empty string if TWILIO_REGION is an empty string', () => {
    const context = { TWILIO_REGION: '' };
    const Serverless = require('../functions/common/twilio-wrappers/serverless.private');
    const env = Serverless.getEnv(context);
    expect(env).toEqual('');
  });

  it('should return env if TWILIO_REGION contains multiple hyphens', () => {
    const context = { TWILIO_REGION: 'stage-ie1-west' };
    const Serverless = require('../functions/common/twilio-wrappers/serverless.private');
    const env = Serverless.getEnv(context);
    expect(env).toEqual('stage');
  });
});
