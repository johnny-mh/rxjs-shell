import { spawn as nodeSpawn, SpawnOptions } from 'child_process';
import { Observable, Subject, Subscriber } from 'rxjs';

export function spawn(command: string, args?: ReadonlyArray<string>, options?: SpawnOptions) {
  return function spawnImplementation(source: Observable<void>): Observable<Buffer[]> {
    return Observable.create((subscriber: Subscriber<Buffer>) => {
      const subscription = source.subscribe(() => {
        const buffers: Buffer[] = [];
        const concatData = (chunk: Buffer) => buffers.push(chunk);
        const proc = nodeSpawn(command, args, options);

        proc.stdout.on('data', concatData);

        proc.stderr.on('data', concatData);

        proc.on('error', err => subscriber.error(Buffer.concat(buffers)));

        proc.on('close', (code: number) => {
          if (code > 0) {
            subscriber.error(Buffer.concat(buffers));
          } else {
            subscriber.next(Buffer.concat(buffers));
            subscriber.complete();
          }

          proc.removeAllListeners();
          proc.stdout.removeAllListeners();
          proc.stderr.removeAllListeners();
        });

      }, err => subscriber.error(err));

      return subscription;
    });
  };
}
