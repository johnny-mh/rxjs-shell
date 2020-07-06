import {ExecFileOptions, execFile as nodeExecFile} from 'child_process';

import {Observable, Subscriber} from 'rxjs';

import {ExecOutput} from './models';
import {ShellError, killProc, listenTerminating} from './util';

export function execFile(
  file: string,
  args?: any[],
  options?: ExecFileOptions
) {
  return new Observable((subscriber: Subscriber<ExecOutput>) => {
    const proc = nodeExecFile(
      file,
      args ? args.map(String) : args,
      options,
      (err, stdout, stderr) => {
        if (err) {
          subscriber.error(
            new ShellError('process exited with an error', err, stdout, stderr)
          );

          return;
        }

        subscriber.next({stdout, stderr});
        subscriber.complete();
      }
    );

    const removeEvents = listenTerminating(() => subscriber.complete());

    return () => {
      killProc(proc);
      removeEvents();
    };
  });
}
