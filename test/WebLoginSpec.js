import { expect } from 'chai';
import WebLogin from '../src/index';

describe('WebLogin', () => {

  it('should instantiate', () => {
    const webLogin = new WebLogin();
    expect(webLogin.shouldSend()).to.be.false();
  });

});
