import {join} from 'path';

import {expect} from 'chai';

import {spawn} from '../src/spawn';
import {ShellError} from '../src/util';
import {MockProcessEvent} from './test-util';

describe('spawn.ts', () => {
  it('should return buffer text after script execution', done => {
    spawn('echo', ['hello world']).subscribe(
      output => {
        expect(String(output.chunk).trim()).to.equal('hello world');
        done();
      },
      err => {
        if (err instanceof ShellError) {
          console.error(err.toAnnotatedString());
        }
      }
    );
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
        expect(String(err)).to.match(/error/i);
        done();
      },
    });
  });

  it('should handle child_process.spawn errors', done => {
    spawn('not_exist').subscribe({
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
      const subscription = spawn('test/fixtures/sleep10sec.sh').subscribe();

      process.on('SIGINT', () => {
        expect(subscription.closed).is.true;
        done();
      });

      mock.emit('SIGINT');
    });
  });
});
