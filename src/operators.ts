import {Observable} from 'rxjs';

import {ExecOutput, SpawnChunk} from './models';
import {ShellError} from './util';

function isSpawnChunk(obj: any): obj is SpawnChunk {
  return !!obj && typeof obj.type === 'string' && Buffer.isBuffer(obj.chunk);
}

export function isExecOutput(obj: any): obj is ExecOutput {
  return (
    !!obj &&
    (Buffer.isBuffer(obj.stdout) || typeof obj.stdout === 'string') &&
    (Buffer.isBuffer(obj.stderr) || typeof obj.stderr === 'string')
  );
}

export function trim<T>(encoding: BufferEncoding = 'utf8') {
  return function trimImplementation(source: Observable<T>): Observable<T> {
    return Observable.create((subscriber: any) => {
      const subscription = source.subscribe(
        value => {
          if (isSpawnChunk(value)) {
            subscriber.next({
              type: value.type,
              chunk: Buffer.from(String(value.chunk).trim(), encoding),
            });
          } else if (isExecOutput(value)) {
            subscriber.next({
              stdout: Buffer.isBuffer(value.stdout)
                ? Buffer.from(value.stdout.toString(encoding).trim())
                : value.stdout.trim(),
              stderr: Buffer.isBuffer(value.stderr)
                ? Buffer.from(value.stderr.toString(encoding).trim())
                : value.stderr.trim(),
            });
          } else {
            subscriber.next(value);
          }
        },
        err => subscriber.error(err),
        () => subscriber.complete()
      );

      return subscription;
    });
  };
}

enum TargetOutput {
  STDOUT = 1 << 0,
  STDERR = 1 << 1,
}

function throwIfNeeded(
  subscriber: any,
  value: any,
  pattern: RegExp,
  targetOutput: TargetOutput
) {
  if (isSpawnChunk(value)) {
    if (
      targetOutput & TargetOutput.STDOUT &&
      'stdout' === value.type &&
      pattern.test(value.chunk.toString())
    ) {
      subscriber.error(
        new ShellError(
          `throwIf: stdout is matching ${pattern}`,
          undefined,
          value.chunk
        )
      );

      return;
    }

    if (
      targetOutput & TargetOutput.STDERR &&
      'stderr' === value.type &&
      pattern.test(value.chunk.toString())
    ) {
      subscriber.error(
        new ShellError(
          `throwIf: stderr is matching ${pattern}`,
          undefined,
          undefined,
          value.chunk
        )
      );

      return;
    }

    subscriber.next(value);

    return;
  } else if (isExecOutput(value)) {
    if (
      targetOutput & TargetOutput.STDOUT &&
      pattern.test(value.stdout.toString())
    ) {
      subscriber.error(
        new ShellError(
          `throwIf: stdout is matching ${pattern}`,
          undefined,
          value.stdout
        )
      );

      return;
    }

    if (
      targetOutput & TargetOutput.STDERR &&
      pattern.test(value.stderr.toString())
    ) {
      subscriber.error(
        new ShellError(
          `throwIf: stderr is matching ${pattern}`,
          undefined,
          undefined,
          value.stderr
        )
      );

      return;
    }

    subscriber.next(value);

    return;
  }

  subscriber.next(value);
}

export function throwIf<T>(pattern: string | RegExp) {
  const _pattern = 'string' === typeof pattern ? new RegExp(pattern) : pattern;

  return function throwIfImplementation(source: Observable<T>): Observable<T> {
    return Observable.create((subscriber: any) => {
      const subscription = source.subscribe(
        value =>
          throwIfNeeded(
            subscriber,
            value,
            _pattern,
            TargetOutput.STDOUT | TargetOutput.STDERR
          ),
        err => subscriber.error(err),
        () => subscriber.complete()
      );

      return subscription;
    });
  };
}

export function throwIfStdout<T>(pattern: string | RegExp) {
  const _pattern = 'string' === typeof pattern ? new RegExp(pattern) : pattern;

  return function throwIfStdoutImplementation(
    source: Observable<T>
  ): Observable<T> {
    return Observable.create((subscriber: any) => {
      const subscription = source.subscribe(
        value =>
          throwIfNeeded(subscriber, value, _pattern, TargetOutput.STDOUT),
        err => subscriber.error(err),
        () => subscriber.complete()
      );

      return subscription;
    });
  };
}

export function throwIfStderr<T>(pattern: string | RegExp) {
  const _pattern = 'string' === typeof pattern ? new RegExp(pattern) : pattern;

  return function throwIfStderrImplementation(
    source: Observable<T>
  ): Observable<T> {
    return Observable.create((subscriber: any) => {
      const subscription = source.subscribe(
        value =>
          throwIfNeeded(subscriber, value, _pattern, TargetOutput.STDERR),
        err => subscriber.error(err),
        () => subscriber.complete()
      );

      return subscription;
    });
  };
}
