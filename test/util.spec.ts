import {expect, spy, use} from 'chai';
import spies from 'chai-spies';

import {join} from 'path';
import {tap} from 'rxjs/operators';
import {spawn} from '../src/spawn';
import {spawnEnd} from '../src/util';

describe('util.ts', () => {
  it('should continue stream when spawn stream completed', done => {
    spawnEnd(
      spawn('sh', [`${join(process.cwd(), 'test/fixtures/stdoutMultiple.sh')}`])
    ).subscribe(() => done());
  });
});
