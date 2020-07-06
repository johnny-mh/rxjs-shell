import {ExecOptions, exec as nodeExec} from 'child_process';

import {Observable, Subscriber} from 'rxjs';

import {ExecOutput} from './models';
import {ShellError, killProc, listenTerminating} from './util';

export function exec(
  command: string,
  options?: ExecOptions
): Observable<ExecOutput> {
  return new Observable((subscriber: Subscriber<ExecOutput>) => {
    const proc = nodeExec(command, options, (err, stdout, stderr) => {
      if (err) {
        subscriber.error(
          new ShellError('process exited with an error', err, stdout, stderr)
        );

        return;
      }

      subscriber.next({stdout, stderr});
      subscriber.complete();
    });

    const removeEvents = listenTerminating(() => subscriber.complete());

    return () => {
      killProc(proc);
      removeEvents();
    };
  });
}
