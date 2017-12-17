const Hapi = require('hapi');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const locale = require('../src/index');

chai.use(chaiAsPromised);

global.chai = chai;
global.expect = chai.expect;
global.should = chai.should();

async function setup(options = {}) {
  const server = new Hapi.Server({
    port: 9001,
  });
  const test = {
    method: 'GET',
    path: '/test',
    handler: () => 'ok',
  };
  await server.register({ plugin: locale, options });
  await server.route(test);
  await server.start();
  return server;
}

describe('hapi-locale-17 with `locales` option', async () => {
  let server;

  beforeEach(async () => {
    server = await setup({
      locales: ['es', 'de', 'en'],
    });
  });

  afterEach(async () => {
    server.stop();
  });

  it('should add `locale` to request with supported `de`', () => {
    return server
      .inject({
        url: '/test',
        headers: {
          'Accept-Language': 'de-DE,de;q=0.9,en-GB;q=0.8,en-US;q=0.7,en;q=0.6',
        },
      })
      .should.be.fulfilled.then((response) => {
        expect(response.request.getLocale()).to.be.equal('de');
      });
  });

  it('should add `locale` to request with supported `de` / query param', () => {
    return server
      .inject({
        url: '/test?locale=de',
        headers: {
          'Accept-Language': 'en-GB;q=0.8,en-US;q=0.7,en;q=0.6',
        },
      })
      .should.be.fulfilled.then((response) => {
        expect(response.request.getLocale()).to.be.equal('de');
      });
  });

  it('should add `locale` to request with default `es` / query param with unsupported locale', () => {
    return server
      .inject({
        url: '/test?locale=tr',
        headers: {
          'Accept-Language': 'q=0.9,en-GB;q=0.8,en-US;q=0.7,en;q=0.6',
        },
      })
      .should.be.fulfilled.then((response) => {
        expect(response.request.getLocale()).to.be.equal('es');
      });
  });
});

describe('hapi-locale-17 with `method` option', async () => {
  let server;

  before(async () => {
    server = await setup({
      locales: ['de', 'en'],
      method: 'getLang',
    });
  });

  after(async () => {
    server.stop();
  });

  it('should add user-defined method', () => {
    return server
      .inject({
        url: '/test',
        headers: {
          'Accept-Language': 'en-GB;q=0.8,en-US;q=0.7,en;q=0.6',
        },
      })
      .should.be.fulfilled.then((response) => {
        expect(response.request.getLang()).to.be.equal('en');
      });
  });
});

describe('hapi-locale-17 with `query` option', async () => {
  let server;

  before(async () => {
    server = await setup({
      locales: ['de', 'en'],
      query: 'lang',
      method: 'getLang',
    });
  });

  after(async () => {
    server.stop();
  });

  it('should accept user-defined query param', () => {
    return server
      .inject({
        url: '/test?lang=de',
        headers: {
          'Accept-Language': 'en-GB;q=0.8,en-US;q=0.7,en;q=0.6',
        },
      })
      .should.be.fulfilled.then((response) => {
        expect(response.request.getLang()).to.be.equal('de');
      });
  });
});

describe('hapi-locale-17 with locale option `en-US`', async () => {
  let server;

  before(async () => {
    server = await setup({
      locales: ['en-US', 'es'],
    });
  });

  after(async () => {
    server.stop();
  });

  it('should accept locale `en-US`', () => {
    return server
      .inject({
        url: '/test',
        headers: {
          'Accept-Language': 'en-GB;q=0.8,en-US;q=0.7,en;q=0.6',
        },
      })
      .should.be.fulfilled.then((response) => {
        expect(response.request.getLocale()).to.be.equal('en-US');
      });
  });

  it('should accept locale `en-US` / query param', () => {
    return server
      .inject({
        url: '/test?locale=en',
        headers: {
          'Accept-Language': 'es-ES,es;q=0.9,en-GB;q=0.8,en-US;q=0.7,en;q=0.6',
        },
      })
      .should.be.fulfilled.then((response) => {
        expect(response.request.getLocale()).to.be.equal('en-US');
      });
  });
});
