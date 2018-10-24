import {spawn as nodeSpawn, SpawnOptions} from 'child_process';
import {Observable, Subscriber} from 'rxjs';

import {RXJS_SHELL_ERROR, SpawnChunk} from './models';
import {killProc, ShellError} from './util';

export function spawn(
  command: string,
  args?: ReadonlyArray<string>,
  options?: SpawnOptions
) {
  return new Observable((subscriber: Subscriber<SpawnChunk>) => {
    try {
      const proc = nodeSpawn(command, args, options);
      const stdouts: Buffer[] = [];
      const stderrs: Buffer[] = [];

      if (proc.stdout) {
        proc.stdout.on('data', chunk => {
          stdouts.push(chunk);
          subscriber.next({type: 'stdout', chunk});
        });
      }

      if (proc.stderr) {
        proc.stderr.on('data', chunk => {
          stderrs.push(chunk);
          subscriber.next({type: 'stderr', chunk});
        });
      }

      proc.on('error', err => {
        process.exitCode = 1;

        subscriber.error(
          new ShellError(
            'spawn: process exited with error',
            RXJS_SHELL_ERROR,
            Buffer.concat(stdouts),
            Buffer.concat(stderrs),
            err
          )
        );
      });

      proc.on('close', (code: number, signal: NodeJS.Signals) => {
        if (code > 0) {
          process.exitCode = code;

          subscriber.error(
            new ShellError(
              `spawn: ${signal} process exited with code ${code}`,
              RXJS_SHELL_ERROR,
              Buffer.concat(stdouts),
              Buffer.concat(stderrs)
            )
          );

          return;
        }

        subscriber.complete();
      });

      return () => killProc(proc);
    } catch (err) {
      subscriber.error(
        new ShellError(err.message, err.code, undefined, undefined, err)
      );
    }
  });
}
