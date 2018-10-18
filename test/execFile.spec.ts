import {expect} from 'chai';
import {existsSync} from 'fs';
import {join} from 'path';
import {sync as rimrafSync} from 'rimraf';
import {execFile} from '../src/execFile';
import {ShellError} from '../src/util';

describe('execFile.ts', () => {
  it('should return buffer text after script execution', done => {
    execFile(join(process.cwd(), 'test/fixtures/echo.sh')).subscribe(output => {
      expect(output.trim()).to.equal('Hello World');
      done();
    });
  });

  it('should kill process when stream unsubscribed', done => {
    const subs = execFile(
      join(process.cwd(), 'test/fixtures/touch.sh')
    ).subscribe();

    subs.add(() => {
      expect(existsSync(join(process.cwd(), 'touched.txt'))).to.be.false;
      done();
    });

    subs.unsubscribe();
  });

  it('should handle error', done => {
    execFile(join(process.cwd(), 'test/fixtures/execFile.sh')).subscribe({
      error(err) {
        expect(err instanceof ShellError).to.true;
        expect(String(err)).to.match(/execFile:/i);
        done();
      },
    });
  });

  after(() => {
    rimrafSync(join(process.cwd(), 'touched.txt'));
  });
});
