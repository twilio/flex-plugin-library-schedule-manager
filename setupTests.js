import "regenerator-runtime/runtime";
import fetch from "jest-fetch-mock";

process.env.FLEX_APP_SERVERLESS_FUNCTONS_DOMAIN =
    "mockServerlessFunctionsDomain";
jest.setTimeout(15000);

// Global test lifecycle handlers
beforeAll(() => {
    fetch.enableMocks();
});

beforeEach(() => {
    fetch.resetMocks();
});

afterEach(() => {});
