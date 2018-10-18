import {expect, spy, use} from 'chai';
import spies from 'chai-spies';

import {exec} from '../src/exec';
import {trim} from '../src/operators';
import {spawn} from '../src/spawn';

use(spies);

const sandbox = spy.sandbox();

describe('operators.ts', () => {
  beforeEach(() => {
    sandbox.on(process.stdout, ['write']);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('trim', done => {
    exec('echo HELLO')
      .pipe(trim())
      .subscribe(output => {
        expect(output).to.equal('HELLO');
        done();
      });
  });
});
