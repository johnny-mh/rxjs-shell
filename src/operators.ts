import {Observable} from 'rxjs';

import {ExecOutput, SpawnChunk} from './models';

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

export function trim<T>(encoding = 'utf8') {
  return function trimImplementation(source: Observable<T>): Observable<T> {
    return Observable.create((subscriber: any) => {
      const subscription = source.subscribe(
        value => {
          try {
            if (isSpawnChunk(value)) {
              subscriber.next({
                type: value.type,
                chunk: new Buffer(String(value.chunk).trim(), encoding),
              });
            } else if (isExecOutput(value)) {
              subscriber.next({
                stdout: Buffer.isBuffer(value.stdout)
                  ? value.stdout.toString(encoding).trim()
                  : value.stdout.trim(),
                stderr: Buffer.isBuffer(value.stderr)
                  ? value.stderr.toString(encoding).trim()
                  : value.stderr.trim(),
              });
            } else {
              subscriber.next(value);
            }
          } catch (err) {
            subscriber.error(err);
          }
        },
        err => subscriber.error(err),
        () => subscriber.complete()
      );

      return subscription;
    });
  };
}
