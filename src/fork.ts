import {fork as nodeFork, ForkOptions as NodeForkOptions} from 'child_process';
import {Observable, Subject, Subscriber, Subscription} from 'rxjs';

import {SpawnChunk} from './models';
import {killProc, ShellError} from './util';

interface ForkOptions<T = any> extends NodeForkOptions {
  send?: Subject<T>;
}

export function fork<T = any>(
  modulePath: string,
  args?: ReadonlyArray<string>,
  options?: ForkOptions
) {
  return new Observable((subscriber: Subscriber<T>) => {
    try {
      const proc = nodeFork(modulePath, args, options);
      const channelSubscriptions: Subscription[] = [];

      if (!!options && options.send instanceof Subject) {
        channelSubscriptions.push(
          options.send.subscribe(msg => proc.send(msg))
        );
      }

      proc.on('message', msg => subscriber.next(msg));

      proc.on('error', err => {
        process.exitCode = 1;

        subscriber.error(
          new ShellError(
            'fork: process exited with error',
            'RXJS_SHELL_ERROR',
            undefined,
            undefined,
            err
          )
        );
      });

      proc.on('close', (code: number, signal: NodeJS.Signals) => {
        channelSubscriptions.forEach(s => s.unsubscribe());

        if (code > 0) {
          process.exitCode = code;

          subscriber.error(
            new ShellError(
              `fork: ${signal} process exited with code ${code}`,
              'RXJS_SHELL_ERROR'
            )
          );

          return;
        }

        subscriber.complete();
      });

      return () => {
        channelSubscriptions.forEach(s => s.unsubscribe());

        killProc(proc);
      };
    } catch (err) {
      subscriber.error(
        new ShellError(err.message, err.code, undefined, undefined, err)
      );
    }
  });
}
