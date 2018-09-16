import {expect} from 'chai';
import {sync as mkdirp} from 'mkdirp';
import {sync as rimraf} from 'rimraf';
import {tap} from 'rxjs/operators';

import {existsSync, writeFileSync} from 'fs';
import {of} from 'rxjs';
import {spawn} from '../src/spawn';

describe('spawn', () => {
  before(() => {
    rimraf('./tmp');
    mkdirp('./tmp');
  });

  it('should execute shell command', done => {
    of(void 0)
      .pipe(spawn('touch', ['test.txt'], {cwd: './tmp'}))
      .subscribe(() => {
        expect(existsSync('./tmp/test.txt')).to.be.true;
        done();
      });
  });

  it('should emit console output buffer', done => {
    of(void 0)
      .pipe(spawn('echo', ['Hello World']))
      .subscribe(buffer => {
        expect(String(buffer)).to.equal('Hello World\n');
        done();
      });
  });

  it('should throw error ', done => {
    mkdirp('./tmp/test2');

    of(void 0)
      .pipe(spawn('mkdir', ['test2'], {cwd: './tmp'}))
      .subscribe(void 0, err => {
        expect(String(err)).to.match(/exists/);
        done();
      });
  });

  it("should throw previous operator's error", done => {
    writeFileSync(
      './tmp/writeFile.sh',
      '#!/usr/bin/env bash\nsleep 0.1\ntouch test3.txt',
      {mode: 0x755}
    );

    of(void 0)
      .pipe(
        tap(() => {
          throw new Error('Hello');
        }),
        spawn('bash', ['./tmp/writeFile.sh'], {cwd: './tmp'})
      )
      .subscribe(void 0, err => {
        expect(String(err)).to.equal('Error: Hello');
        expect(existsSync('./tmp/test3.txt')).to.be.false;
        done();
      });
  });

  it('should cancel command when unsubscribe', done => {
    writeFileSync(
      './tmp/cancel.sh',
      '#!/usr/bin/env bash\nsleep 0.1\necho Hello',
      {mode: 0x755}
    );

    let output = '';

    const sub = of(void 0)
      .pipe(spawn('bash', ['./tmp/cancel.sh']))
      .subscribe(o => (output = String(o)));

    sub.add(() => {
      expect(output).to.equal('');
      done();
    });

    Promise.resolve().then(() => sub.unsubscribe());
  });

  it('should cancel command when unsubscribe2', done => {
    let exist = false;

    const sub = of(void 0)
      .pipe(
        spawn('git', ['clone', 'github.com/johnny-mh/rxjs-shell-operators'], {
          cwd: './tmp',
        })
      )
      .subscribe({
        next() {
          exist = existsSync('./tmp/rxjs-shell-operators');
        },
      });

    sub.add(() => {
      expect(exist).to.be.false;
      done();
    });

    Promise.resolve().then(() => sub.unsubscribe());
  });

  after(() => rimraf('./tmp'));
});
