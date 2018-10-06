import {fork as nodeFork, ForkOptions as NodeForkOptions} from 'child_process';
import {Observable, Subject, Subscriber, Subscription} from 'rxjs';
import {killProc} from './util';

interface ForkOptions<T = any, R = T> extends NodeForkOptions {
  send?: Subject<T>;
  recv?: Subject<R>;
}

export function fork(
  modulePath: string,
  args?: ReadonlyArray<string>,
  options?: ForkOptions
) {
  return new Observable((subscriber: Subscriber<Buffer>) => {
    const proc = nodeFork(modulePath, args, options);
    const channelSubscriptions: Subscription[] = [];

    if (!!options && options.send instanceof Subject) {
      channelSubscriptions.push(options.send.subscribe(msg => proc.send(msg)));
    }

    if (!!options && options.recv instanceof Subject) {
      const {recv} = options;

      proc.on('message', msg => recv.next(msg));
    }

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
      channelSubscriptions.forEach(s => s.unsubscribe());

      if (code > 0) {
        process.exitCode = code;
        subscriber.error(code);
        return;
      }

      subscriber.complete();
    });

    return () => {
      channelSubscriptions.forEach(s => s.unsubscribe());

      killProc(proc);
    };
  });
}
