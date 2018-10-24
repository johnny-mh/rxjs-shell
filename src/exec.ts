import {exec as nodeExec, ExecOptions} from 'child_process';
import {Observable, Subscriber} from 'rxjs';

import {ExecOutput, RXJS_SHELL_ERROR} from './models';
import {killProc, ShellError} from './util';

export function exec(command: string, options?: ExecOptions) {
  return new Observable((subscriber: Subscriber<ExecOutput>) => {
    const proc = nodeExec(command, options, (err, stdout, stderr) => {
      if (!!err) {
        subscriber.error(
          new ShellError('exec', RXJS_SHELL_ERROR, stdout, stderr, err)
        );
        return;
      }

      subscriber.next({stdout, stderr});
      subscriber.complete();
    });

    return () => killProc(proc);
  });
}
