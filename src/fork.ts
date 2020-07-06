import {ForkOptions, Serializable, fork as nodeFork} from 'child_process';

import {Observable, Subject, Subscriber, Subscription} from 'rxjs';

import {ShellError, killProc, listenTerminating} from './util';

export function fork(
  modulePath: string,
  args?: any[],
  options?: ForkOptions & {send?: Subject<any>}
) {
  return new Observable((subscriber: Subscriber<Serializable>) => {
    const proc = nodeFork(modulePath, args ? args.map(String) : args, options);
    const channelSubscriptions: Subscription[] = [];

    if (!!options && options.send instanceof Subject) {
      channelSubscriptions.push(options.send.subscribe(msg => proc.send(msg)));
    }

    proc.on('message', msg => subscriber.next(msg));

    proc.on('error', err => {
      process.exitCode = 1;

      subscriber.error(new ShellError('process exited with an error', err));
    });

    proc.on('close', (code, signal) => {
      channelSubscriptions.forEach(s => s.unsubscribe());

      if (code > 0) {
        process.exitCode = code;

        subscriber.error(
          new ShellError(`process exited with code: ${code}`, {
            code,
            signal,
          })
        );

        return;
      }

      subscriber.complete();
    });

    const removeEvents = listenTerminating(() => subscriber.complete());

    return () => {
      channelSubscriptions.forEach(s => s.unsubscribe());

      killProc(proc);
      removeEvents();
    };
  });
}
