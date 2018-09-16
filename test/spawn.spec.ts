import {expect} from 'chai';
import {sync as mkdirp} from 'mkdirp';
import {sync as rimraf} from 'rimraf';
import {catchError, map} from 'rxjs/operators';

import {existsSync} from 'fs';
import {of, throwError} from 'rxjs';
import {spawn} from '../src/spawn';

describe('spawn', () => {
  before(() => mkdirp('./tmp'));

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

  after(() => rimraf('./tmp'));
});
