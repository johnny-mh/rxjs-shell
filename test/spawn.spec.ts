import {expect} from 'chai';
import {spawn} from '../src/spawn';

describe('spawn.ts', () => {
  it('should return buffer text after script execution', done => {
    spawn('echo', ['hello world']).subscribe(buf => {
      expect(String(buf).trim()).to.equal('hello world');
      done();
    });
  });

  it('should handle errors', done => {
    spawn('mkdir test').subscribe({
      error(err) {
        expect(String(err)).to.match(/spawn:/i);
        done();
      },
    });
  });
});
