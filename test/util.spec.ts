import {expect, spy, use} from 'chai';
import spies from 'chai-spies';
import {join} from 'path';

import {tap} from 'rxjs/operators';
import {isExecOutput} from '../src/operators';
import {spawn} from '../src/spawn';
import {ShellError, spawnEnd} from '../src/util';

describe('util.ts', () => {
  it('should continue stream when spawn stream completed', done => {
    spawnEnd(
      spawn('sh', [join(process.cwd(), 'test/fixtures/stdoutMultiple.sh')])
    ).subscribe(() => done());
  });

  it("should emit `ExecOutput` type data that child process's output", done => {
    spawnEnd(
      spawn('sh', [join(process.cwd(), 'test/fixtures/echostd.sh')])
    ).subscribe(out => {
      expect(isExecOutput(out)).to.be.true;
      done();
    });
  });

  it('should pass error', done => {
    spawnEnd(spawn('oijweroijweoirjweoirj')).subscribe({
      error(err) {
        expect(err instanceof ShellError).to.be.true;
        done();
      },
    });
  });
});
