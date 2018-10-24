import {expect} from 'chai';
import {join} from 'path';

import {spawn} from '../src/spawn';
import {ShellError} from '../src/util';

describe('spawn.ts', () => {
  it('should return buffer text after script execution', done => {
    spawn('echo', ['hello world']).subscribe(output => {
      expect(String(output.chunk).trim()).to.equal('hello world');
      done();
    });
  });

  it('should return stderr text.', done => {
    spawn('sh', [join(process.cwd(), 'test/fixtures/echoStderr.sh')]).subscribe(
      output => {
        expect(output.type).to.equal('stderr');
        expect(String(output.chunk).trim()).to.equal('ERR');
        done();
      }
    );
  });

  it('should handle errors', done => {
    spawn('mkdir test').subscribe({
      error(err) {
        expect(String(err)).to.match(/spawn:/i);
        done();
      },
    });
  });

  it('should handle child_process.spawn errors', done => {
    spawn('').subscribe({
      error(err) {
        expect(err instanceof ShellError).to.true;
        done();
      },
    });
  });
});
