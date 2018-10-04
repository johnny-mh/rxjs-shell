import {spawn as nodeSpawn, SpawnOptions} from 'child_process';
import {Observable, Subscriber} from 'rxjs';
import {killProc} from './util';

export function spawn(
  command: string,
  args?: ReadonlyArray<string>,
  options?: SpawnOptions
) {
  return new Observable((subscriber: Subscriber<Buffer>) => {
    const proc = nodeSpawn(command, args, options);

    if (proc.stdout) {
      proc.stdout.on('data', chunk => subscriber.next(chunk));
    }

    if (proc.stderr) {
      proc.stderr.on('data', chunk => subscriber.next(chunk));
    }

    proc.on('error', err => {
      process.exitCode = 1;
      subscriber.error(err);
    });

    proc.on('close', code => {
      if (code > 0) {
        process.exitCode = code;
        subscriber.error(code);
        return;
      }

      subscriber.complete();
    });

    return () => killProc(proc);
  });
}
