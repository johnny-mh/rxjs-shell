import {expect} from 'chai';
import {existsSync} from 'fs';
import {join} from 'path';
import {sync as rimrafSync} from 'rimraf';

import {Subject} from 'rxjs';
import {fork} from '../src/fork';

describe('fork.ts', () => {
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
    const recv = new Subject<string>();

    fork(join(process.cwd(), 'test/fixtures/fork3.js'), undefined, {
      send,
      recv,
    }).subscribe();

    recv.subscribe(msg => {
      expect(msg).to.equal('hello world');
      done();
    });

    send.next('hello');
  });

  after(() => {
    rimrafSync(join(process.cwd(), 'forkTouched.txt'));
    rimrafSync(join(process.cwd(), 'forkTouched2.txt'));
  });
});
