import {existsSync} from 'fs';
import {join} from 'path';

import {expect} from 'chai';
import {sync as rimrafSync} from 'rimraf';

import {execFile} from '../src/execFile';
import {ShellError} from '../src/util';
import {MockProcessEvent} from './test-util';

describe('execFile.ts', () => {
  after(() => {
    rimrafSync(join(process.cwd(), 'touched.txt'));
  });

  it('should return buffer text after script execution', done => {
    execFile(join(process.cwd(), 'test/fixtures/echo.sh')).subscribe(output => {
      expect(String(output.stdout).trim()).to.equal('Hello World');
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
        expect(String(err)).to.match(/error/i);
        done();
      },
    });
  });

  describe('should kill process when specific signals generated', () => {
    let mock: MockProcessEvent;

    beforeEach(() => (mock = new MockProcessEvent()));
    afterEach(() => mock.destroy());

    it('SIGINT', done => {
      const subscription = execFile('test/fixtures/sleep10sec.sh').subscribe();

      process.on('SIGINT', () => {
        expect(subscription.closed).is.true;
        done();
      });

      mock.emit('SIGINT');
    });
  });
});
