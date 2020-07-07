import {join} from 'path';

import {expect} from 'chai';

import {execFile} from '../src/execFile';
import {isExecOutput} from '../src/models';
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

  it('should display annotated error', done => {
    execFile(join(process.cwd(), 'test/fixtures/no_execute_perm.sh')).subscribe(
      {
        error(err) {
          expect(err instanceof ShellError).to.be.true;

          if (err instanceof ShellError) {
            expect(err.toAnnotatedString()).to.match(/\* ERROR \*/);
            expect(err.toAnnotatedString()).to.match(/"EACCES"/);
          }

          done();
        },
      }
    );
  });
});
