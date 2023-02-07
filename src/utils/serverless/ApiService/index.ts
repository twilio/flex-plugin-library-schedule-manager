import * as Flex from '@twilio/flex-ui';
import { EncodedParams } from '../../../types/serverless';
import { UIAttributes } from '../../../types/manager/ServiceConfiguration';
import { random }  from 'lodash'


function delay<T>(ms: number, result?: T) {
  return new Promise(resolve => setTimeout(() => resolve(result), ms));
}


export default abstract class ApiService {

  protected manager = Flex.Manager.getInstance();
  readonly serverlessDomain: string;
  readonly serverlessProtocol: string;

  constructor() {
        // use serverless_functions_domain from .env

        this.serverlessProtocol = "https";
        this.serverlessDomain = "";
        debugger;
    
        try {
          if (process.env?.FLEX_APP_SERVERLESS_FUNCTONS_DOMAIN)
          this.serverlessDomain = process.env?.FLEX_APP_SERVERLESS_FUNCTONS_DOMAIN;
    
        if (!this.serverlessDomain)
          throw Error("serverless_functions_domain is not set env file");
        } catch (e) {
          console.error(e);
        }
  }

  protected buildBody(encodedParams: EncodedParams): string {
    return Object.keys(encodedParams).reduce((result, paramName, idx) => {
      if (encodedParams[paramName] === undefined) {
        return result;
      }
      if (idx > 0) {
        return `${result}&${paramName}=${encodedParams[paramName]}`;
      }
      return `${paramName}=${encodedParams[paramName]}`;
    }, '');
  }

  protected fetchJsonWithReject<T>(url: string, config: RequestInit, attempts = 0): Promise<T> {
    return fetch(url, config)
      .then(response => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .catch(async (error) => {
        // Try to return proper error message from both caught promises and Error objects
        // https://gist.github.com/odewahn/5a5eeb23279eed6a80d7798fdb47fe91
        try {
          // Generic retry when calls return a 'too many requests' response
          // request is delayed by a random number which grows with the number of retries
          if (error.status === 429 && attempts < 10) {
            await delay(random(100, 750) + (attempts * 100));
            return await this.fetchJsonWithReject<T>(url, config, attempts + 1);
          }
          return error.json().then((response: any) => {
            throw response;
          });
        } catch (e) {
          throw error;
        }
      });
  }
}
