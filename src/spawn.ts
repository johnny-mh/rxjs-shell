import {SpawnOptionsWithoutStdio, spawn as nodeSpawn} from 'child_process';

import {Observable, Subscriber} from 'rxjs';

import {SpawnChunk} from './models';
import {ShellError, killProc, listenTerminating} from './util';

export function spawn(
  command: string,
  args?: any[],
  options?: SpawnOptionsWithoutStdio
) {
  return new Observable((subscriber: Subscriber<SpawnChunk>) => {
    const proc = nodeSpawn(command, args ? args.map(String) : [], options);
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
          'process exited with an error',
          err,
          Buffer.concat(stdouts),
          Buffer.concat(stderrs)
        )
      );
    });

    proc.on('close', (code: number, signal: NodeJS.Signals) => {
      if (code > 0) {
        process.exitCode = code;

        subscriber.error(
          new ShellError(
            `process exited with code ${code}`,
            {code, signal},
            Buffer.concat(stdouts),
            Buffer.concat(stderrs)
          )
        );

        return;
      }

      subscriber.complete();
    });

    const removeEvents = listenTerminating(() => subscriber.complete());

    return () => {
      killProc(proc);
      removeEvents();
    };
  });
}
