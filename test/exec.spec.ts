import {expect} from 'chai';
import {exec} from '../src/exec';

describe('exec.ts', () => {
  it('should return buffer text after script execution', done => {
    exec('echo "Hello World"').subscribe(output => {
      expect(output.trim()).to.equal('Hello World');
      done();
    });
  });

  it('should handle errors', done => {
    exec('mkdir test').subscribe({
      error(err) {
        expect(String(err)).to.match(/error/i);
        done();
      },
    });
  });
});
