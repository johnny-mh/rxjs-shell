import {execFile as nodeExecFile, ExecFileOptions} from 'child_process';
import {Observable, Subscriber} from 'rxjs';
import {killProc} from './util';

export function execFile(
  file: string,
  args?: ReadonlyArray<string>,
  options?: ExecFileOptions
) {
  return new Observable((subscriber: Subscriber<string>) => {
    const proc = nodeExecFile(file, args, options, (err, stdout, stderr) => {
      if (err) {
        subscriber.error({err, stdout, stderr});
        return;
      }

      subscriber.next(`${stdout}${stderr}`);
      subscriber.complete();
    });

    return () => killProc(proc);
  });
}
