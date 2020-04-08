import {expect} from 'chai';
import {throwIfStderr} from '../src';
import {exec} from '../src/exec';

describe('integration tests', () => {
  it('exec throwIfStderr', done => {
    exec('sh test/fixtures/echostd.sh')
      .pipe(throwIfStderr(/WOR/))
      .subscribe(
        () => {
          expect.fail('absolutly not');
          done();
        },
        err => {
          expect(err.toString()).equal(
            'Error: throwIf: stderr is matching /WOR/'
          );
          done();
        }
      );
  });
});
