import {expect} from 'chai';
import {switchMap} from 'rxjs/operators';

import {exec} from '../src/exec';
import {ShellError} from '../src/util';
import {MockProcessEvent} from './test-util';

describe('exec.ts', () => {
  it('should return buffer text after script execution', done => {
    exec('echo "Hello World"').subscribe(output => {
      expect(String(output.stdout).trim()).to.equal('Hello World');
      done();
    });
  });

  it('should call procCallback with ChildProcess object', done => {
    exec('cat -', undefined, proc => {
      proc.stdin?.write('Hello World');
      proc.stdin?.end();
    }).subscribe(output => {
      expect(String(output.stdout).trim()).to.equal('Hello World');
      done();
    });
  });

  it('should return stderr text.', done => {
    exec('>&2 echo "ERR"').subscribe(output => {
      expect(String(output.stderr).trim()).to.equal('ERR');
      done();
    });
  });

  it('should handle errors', done => {
    exec('mkdir test').subscribe({
      error(err) {
        expect(err instanceof ShellError).to.true;
        expect(String(err)).to.match(/error/i);
        done();
      },
    });
  });

  it('should kill process when stream completed', done => {
    exec('sh ./test/fixtures/echo2.sh')
      .pipe(switchMap(() => exec('sh ./test/fixtures/echo.sh')))
      .subscribe(output => {
        expect(String(output.stdout).trim()).to.equal('Hello World');
        done();
      });
  });

  describe('should kill process when specific signals generated', () => {
    let mock: MockProcessEvent;

    beforeEach(() => (mock = new MockProcessEvent()));
    afterEach(() => mock.destroy());

    it('SIGINT', done => {
      const subscription = exec('sh ./test/fixtures/sleep10sec.sh').subscribe();

      process.on('SIGINT', () => {
        expect(subscription.closed).is.true;
        done();
      });

      mock.emit('SIGINT');
    });
  });
});
