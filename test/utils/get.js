import assert from 'assert';
import sinon from 'sinon';
import axios from 'axios';
import utils from '../../src/utils';

describe('utils.get', () => {
  let stub1;
  let stub2;
  beforeEach(() => {
    stub1 = sinon.stub(axios, 'get').resolves({ data: { data: 'data' } });
    sinon.stub(utils, 'version').callsFake(() => {
      return '3.0.0';
    });
  });

  afterEach(() => {
    stub1.restore();
    utils.version.restore();
  });

  it('should invoke get', async () => {
    let data = await utils.get('entity/123', {
      apikey: 'foo',
      url: 'http://epi2me.test',
    });

    assert.deepEqual(data, { data: 'data' });

    assert.deepEqual(stub1.args[0], [
      'http://epi2me.test/entity/123',
      {
        uri: 'http://epi2me.test/entity/123',
        gzip: true,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-EPI2ME-ApiKey': 'foo',
          'X-EPI2ME-Client': 'api',
          'X-EPI2ME-Version': '3.0.0',
        },
      },
    ]);
  });

  it('should invoke get without url mangling', async () => {
    let data = await utils.get('https://epi2me.internal/entity/123', {
      skip_url_mangle: true,
      apikey: 'foo',
      url: 'http://epi2me.test',
    });

    assert.deepEqual(data, { data: 'data' });

    assert.deepEqual(stub1.args[0], [
      'https://epi2me.internal/entity/123',
      {
        uri: 'https://epi2me.internal/entity/123',
        gzip: true,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-EPI2ME-ApiKey': 'foo',
          'X-EPI2ME-Client': 'api',
          'X-EPI2ME-Version': '3.0.0',
        },
      },
    ]);
  });

  it('should invoke get with proxy', async () => {
    let data = await utils.get('entity/123', {
      proxy: 'http://proxy.internal:3128/',
      apikey: 'foo',
      url: 'http://epi2me.test',
    });

    assert.deepEqual(data, { data: 'data' });

    assert.deepEqual(stub1.args[0], [
      'http://epi2me.test/entity/123',
      {
        uri: 'http://epi2me.test/entity/123',
        proxy: 'http://proxy.internal:3128/',
        gzip: true,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-EPI2ME-ApiKey': 'foo',
          'X-EPI2ME-Client': 'api',
          'X-EPI2ME-Version': '3.0.0',
        },
      },
    ]);
  });
});
