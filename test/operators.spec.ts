import * as chai from 'chai';
import chaiExclude from 'chai-exclude';
import {TestScheduler} from 'rxjs/testing';

import {throwIf, throwIfStderr, throwIfStdout, trim} from '../src/operators';
import {ShellError} from '../src/util';

chai.use(chaiExclude);

describe('operators.ts', () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => {
      chai.expect(actual).excludingEvery('stack').deep.equal(expected);
    });
  });

  describe('trim', () => {
    it('should trim ExecOutput contents', () => {
      scheduler.run(({cold, expectObservable}) => {
        const source$ = cold('-a', {
          a: {stdout: Buffer.from(' Hello '), stderr: Buffer.from(' World')},
        });

        expectObservable(source$.pipe(trim())).toBe('-x', {
          x: {stdout: Buffer.from('Hello'), stderr: Buffer.from('World')},
        });
      });
    });

    it('should trim SpawnChunk contents', () => {
      scheduler.run(({cold, expectObservable}) => {
        const source$ = cold('-a', {
          a: {type: 'stdout', chunk: Buffer.from(' Hello World ')},
        });

        expectObservable(source$.pipe(trim())).toBe('-x', {
          x: {type: 'stdout', chunk: Buffer.from('Hello World')},
        });
      });
    });

    it('should not handle other values', () => {
      scheduler.run(({cold, expectObservable}) => {
        const value = {hello: 'world'};
        const source$ = cold('-a', {a: value});

        expectObservable(source$.pipe(trim())).toBe('-x', {
          x: value,
        });
      });
    });
  });

  describe('throwIf', () => {
    it('should throw error by SpawnChunk contents pattern matching', () => {
      scheduler.run(({cold, expectObservable}) => {
        const source$ = cold('a', {
          a: {
            type: 'stdout',
            chunk: Buffer.from('Error: test error'),
          },
        });

        expectObservable(source$.pipe(throwIf('Error:'))).toBe(
          '#',
          null,
          new ShellError(
            'throwIf: stdout is matching /Error:/',
            undefined,
            Buffer.from('Error: test error'),
            undefined
          )
        );
      });
    });

    it('should throw error by ExecOutput contents pattern matching', () => {
      scheduler.run(({cold, expectObservable}) => {
        const source$ = cold('a', {
          a: {
            stdout: Buffer.from('GREAT!'),
            stderr: Buffer.from(''),
          },
        });

        expectObservable(source$.pipe(throwIf(/GREAT!/))).toBe(
          '#',
          null,
          new ShellError(
            'throwIf: stdout is matching /GREAT!/',
            undefined,
            Buffer.from('GREAT!'),
            undefined
          )
        );
      });
    });

    it('should not throw error when pattern is not matching', () => {
      scheduler.run(({cold, expectObservable}) => {
        const value = {
          stdout: Buffer.from('GREAT!'),
          stderr: Buffer.from(''),
        };
        const source$ = cold('a', {a: value});

        expectObservable(source$.pipe(throwIf(/NOTGREAT!/))).toBe('x', {
          x: value,
        });
      });
    });

    it('should not handle other values', () => {
      scheduler.run(({cold, expectObservable}) => {
        const value = {hello: 'world'};
        const source$ = cold('a', {a: value});

        expectObservable(source$.pipe(throwIf(/GOOD/))).toBe('x', {
          x: value,
        });
      });
    });
  });

  describe('throwIfStdout', () => {
    it('should throw error by SpawnChunk stdout contents pattern matching', () => {
      scheduler.run(({cold, expectObservable}) => {
        const source$ = cold('a', {
          a: {
            type: 'stdout',
            chunk: Buffer.from('Error: test error'),
          },
        });

        expectObservable(source$.pipe(throwIfStdout('Error:'))).toBe(
          '#',
          null,
          new ShellError(
            'throwIf: stdout is matching /Error:/',
            undefined,
            Buffer.from('Error: test error')
          )
        );
      });
    });

    it('should not throw error by SpawnChunk stderr contents pattern matching', () => {
      scheduler.run(({cold, expectObservable}) => {
        const value = {
          type: 'stderr',
          chunk: Buffer.from('Error: test error'),
        };
        const source$ = cold('a', {a: value});

        expectObservable(source$.pipe(throwIfStdout(/Error:/))).toBe('x', {
          x: value,
        });
      });
    });

    it('should not throw error by SpawnChunk stdout contents pattern not matching', () => {
      scheduler.run(({cold, expectObservable}) => {
        const value = {
          type: 'stdout',
          chunk: Buffer.from('Error: test error'),
        };
        const source$ = cold('a', {a: value});

        expectObservable(source$.pipe(throwIfStdout(/NotError:/))).toBe('x', {
          x: value,
        });
      });
    });

    it('should throw error by ExecOutput stdout contents pattern matching', () => {
      scheduler.run(({cold, expectObservable}) => {
        const source$ = cold('a', {
          a: {
            stdout: Buffer.from('Stdout: test'),
            stderr: Buffer.from('Stderr: test'),
          },
        });

        expectObservable(source$.pipe(throwIfStdout(/Stdout:/))).toBe(
          '#',
          null,
          new ShellError(
            'throwIf: stdout is matching /Stdout:/',
            undefined,
            Buffer.from('Stdout: test')
          )
        );
      });
    });

    it('should not throw error by ExecOutput stderr despite of contents pattern matching', () => {
      scheduler.run(({cold, expectObservable}) => {
        const value = {
          stdout: Buffer.from('stdout'),
          stderr: Buffer.from('stderr'),
        };
        const source$ = cold('a', {a: value});

        expectObservable(source$.pipe(throwIfStdout(/stderr/))).toBe('x', {
          x: value,
        });
      });
    });
  });

  describe('throwIfStderr', () => {
    it('should throw error by SpawnChunk stderr contents pattern matching', () => {
      scheduler.run(({cold, expectObservable}) => {
        const source$ = cold('a', {
          a: {
            type: 'stderr',
            chunk: Buffer.from('Error: test error'),
          },
        });

        expectObservable(source$.pipe(throwIfStderr('Error:'))).toBe(
          '#',
          null,
          new ShellError(
            'throwIf: stderr is matching /Error:/',
            undefined,
            undefined,
            Buffer.from('Error: test error')
          )
        );
      });
    });

    it('should not throw error by SpawnChunk stdout contents pattern matching', () => {
      scheduler.run(({cold, expectObservable}) => {
        const value = {
          type: 'stdout',
          chunk: Buffer.from('Error: test error'),
        };
        const source$ = cold('a', {a: value});

        expectObservable(source$.pipe(throwIfStderr(/Error:/))).toBe('x', {
          x: value,
        });
      });
    });

    it('should not throw error by SpawnChunk stderr contents pattern not matching', () => {
      scheduler.run(({cold, expectObservable}) => {
        const value = {
          type: 'stderr',
          chunk: Buffer.from('Error: test error'),
        };
        const source$ = cold('a', {a: value});

        expectObservable(source$.pipe(throwIfStderr(/NotError:/))).toBe('x', {
          x: value,
        });
      });
    });

    it('should throw error by ExecOutput stderr contents pattern matching', () => {
      scheduler.run(({cold, expectObservable}) => {
        const source$ = cold('a', {
          a: {
            stdout: Buffer.from('Stdout: test'),
            stderr: Buffer.from('Stderr: test'),
          },
        });

        expectObservable(source$.pipe(throwIfStderr(/Stderr:/))).toBe(
          '#',
          null,
          new ShellError(
            'throwIf: stderr is matching /Stderr:/',
            undefined,
            undefined,
            Buffer.from('Stderr: test')
          )
        );
      });
    });

    it('should not throw error by ExecOutput stdout despite of contents pattern matching', () => {
      scheduler.run(({cold, expectObservable}) => {
        const value = {
          stdout: Buffer.from('stdout'),
          stderr: Buffer.from('stderr'),
        };
        const source$ = cold('a', {a: value});

        expectObservable(source$.pipe(throwIfStderr(/stdout/))).toBe('x', {
          x: value,
        });
      });
    });
  });
});
