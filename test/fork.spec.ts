import {existsSync} from 'fs';
import {join} from 'path';

import {expect} from 'chai';
import {sync as rimrafSync} from 'rimraf';
import {Subject} from 'rxjs';

import {fork} from '../src/fork';
import {ShellError} from '../src/util';
import {MockProcessEvent} from './test-util';

describe('fork.ts', () => {
  after(() => {
    rimrafSync(join(process.cwd(), 'forkTouched.txt'));
    rimrafSync(join(process.cwd(), 'forkTouched2.txt'));
  });

  it('should execute module', done => {
    fork(join(process.cwd(), 'test/fixtures/forkTouch.js')).subscribe({
      complete() {
        expect(existsSync(join(process.cwd(), 'forkTouched.txt'))).to.be.true;
        done();
      },
    });
  });

  it('should kill process when stream unsubscribed', done => {
    const subs = fork(
      join(process.cwd(), 'test/fixtures/forkTouc2.js')
    ).subscribe();

    subs.add(() => {
      expect(existsSync(join(process.cwd(), 'forkTouched2.txt'))).to.be.false;
      done();
    });

    subs.unsubscribe();
  });

  it('should send and receive message to forked process', done => {
    const send = new Subject<string>();

    fork(join(process.cwd(), 'test/fixtures/fork3.js'), undefined, {
      send,
    }).subscribe(msg => {
      expect(msg).to.equal('hello world');
      done();
    });

    send.next('hello');
  });

  it('should fork ts module', done => {
    fork(join(process.cwd(), 'test/fixtures/echo.ts'), undefined).subscribe(
      () => done()
    );
  });

  it('should handle errors', done => {
    fork(join(process.cwd(), 'test/fixtures/forkError.js')).subscribe({
      error(err) {
        expect(err instanceof ShellError).to.true;
        done();
      },
    });
  });

  describe('should kill process when specific signals generated', () => {
    let mock: MockProcessEvent;

    beforeEach(() => (mock = new MockProcessEvent()));
    afterEach(() => mock.destroy());

    it('SIGINT', done => {
      const subscription = fork('test/fixtures/sleep10sec.sh').subscribe();

      process.on('SIGINT', () => {
        expect(subscription.closed).is.true;
        done();
      });

      mock.emit('SIGINT');
    });
  });
});
