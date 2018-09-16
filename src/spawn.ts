import {
  spawn as nodeSpawn,
  SpawnOptions as NodeSpawnOptions,
} from 'child_process';
import {Observable, Subscriber} from 'rxjs';

export interface SpawnOptions extends NodeSpawnOptions {
  threshold?: number;
}

export function spawn(
  command: string,
  args?: ReadonlyArray<string>,
  options?: SpawnOptions
) {
  return function spawnImplementation(
    source: Observable<void>
  ): Observable<Buffer[]> {
    return Observable.create((subscriber: Subscriber<Buffer>) => {
      const buffers: Buffer[] = [];
      const proc = nodeSpawn(command, args, options);
      const subscription = source.subscribe(
        () => {
          proc.stdout.on('data', (chunk: Buffer) => buffers.push(chunk));

          proc.stderr.on('data', (chunk: Buffer) => buffers.push(chunk));

          proc.on('error', () => subscriber.error(Buffer.concat(buffers)));

          proc.on('close', (code: number) => {
            proc.removeAllListeners();
            proc.stdout.removeAllListeners();
            proc.stderr.removeAllListeners();

            if (code > 0) {
              subscriber.error(Buffer.concat(buffers));
            } else {
              subscriber.next(Buffer.concat(buffers));
              subscriber.complete();
            }
          });
        },
        err => subscriber.error(err)
      );

      subscriber.add(() => {
        if (!proc.killed) {
          proc.kill('SIGUSR1');
        }
      });

      return subscription;
    });
  };
}
