import {expect} from 'chai';
import {of} from 'rxjs';

import {exec} from '../src/exec';
import {trim} from '../src/operators';
import {spawn} from '../src/spawn';
import {ShellError} from '../src/util';

describe('operators.ts', () => {
  it('trim exec', done => {
    exec('echo HELLO')
      .pipe(trim())
      .subscribe(output => {
        expect(String(output.stdout)).to.equal('HELLO');
        done();
      });
  });

  it('trim spawn', done => {
    spawn('echo', ['HELLO'])
      .pipe(trim())
      .subscribe(chunk => {
        expect(String(chunk.chunk)).to.equal('HELLO');
        done();
      });
  });

  it('pass other value', done => {
    const origin = {hello: 'world'};
    of(origin)
      .pipe(trim())
      .subscribe(out => {
        expect(out === origin).to.be.true;
        done();
      });
  });

  it('pass error', done => {
    spawn('')
      .pipe(trim())
      .subscribe({
        error(err) {
          expect(err instanceof ShellError).to.be.true;
          done();
        },
      });
  });
});
