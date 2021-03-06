import sinon from 'sinon';
import assert from 'assert';
import bunyan from 'bunyan';
import REST from '../../src/rest';
import utils from '../../src/utils';

describe('rest.workflowConfig', () => {
  it('must invoke get with options', async () => {
    const ringbuf = new bunyan.RingBuffer({
      limit: 100,
    });
    const log = bunyan.createLogger({
      name: 'log',
      stream: ringbuf,
    });
    const stub = sinon.stub(utils, 'get').callsFake((uri, options) => {
      assert.deepEqual(
        options,
        {
          log,
          agent_version: '3.0.0',
          local: false,
          signing: true,
          url: 'https://epi2me.nanoporetech.com',
          user_agent: 'EPI2ME API',
        },
        'options passed',
      );
      assert.equal(uri, 'workflow/config/1234', 'url passed');
    });

    const rest = new REST({
      log,
      agent_version: '3.0.0',
    });
    try {
      await rest.workflowConfig('1234');
    } catch (e) {
      assert.fail(e);
    } finally {
      stub.restore();
    }
  });
});
