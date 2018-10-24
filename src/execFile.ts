import {execFile as nodeExecFile, ExecFileOptions} from 'child_process';
import {Observable, Subscriber} from 'rxjs';

import {ExecOutput, RXJS_SHELL_ERROR} from './models';
import {killProc, ShellError} from './util';

export function execFile(
  file: string,
  args?: ReadonlyArray<string>,
  options?: ExecFileOptions
) {
  return new Observable((subscriber: Subscriber<ExecOutput>) => {
    const proc = nodeExecFile(file, args, options, (err, stdout, stderr) => {
      if (!!err) {
        subscriber.error(
          new ShellError('execFile', RXJS_SHELL_ERROR, stdout, stderr, err)
        );
        return;
      }

      subscriber.next({stdout, stderr});
      subscriber.complete();
    });

    return () => killProc(proc);
  });
}
