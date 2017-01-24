var should = require('chai').should();
import WebLogin from '../src/index';

describe('WebLogin', () => {

  it('should instantiate', () => {
    const webLogin = new WebLogin();
    webLogin.shouldSend().should.be.false;
  });

});
