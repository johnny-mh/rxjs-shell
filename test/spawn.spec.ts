import { expect } from 'chai';
import { existsSync, unlinkSync } from 'fs';
import 'mocha';

import { spawn } from '../src/spawn';

describe('spawn', () => {
  it('should execute shell command', (done) => {
    spawn('touch ./test.txt').subscribe(() => {
      expect(existsSync('./test.txt')).to.equal(true);
      done();
    });
  });

  after(() => {
    unlinkSync('./test.txt');
  });
});
