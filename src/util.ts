import {ChildProcess} from 'child_process';
import {Observable, Subject} from 'rxjs';
import kill from 'tree-kill';

import {ExecOutput, SpawnChunk} from './models';

export function killProc(proc: ChildProcess) {
  if (proc.stdout) {
    proc.stdout.removeAllListeners();
  }

  if (proc.stderr) {
    proc.stderr.removeAllListeners();
  }

  proc.removeAllListeners();

  if (typeof proc.pid === 'number') {
    kill(proc.pid, 'SIGKILL');

    return;
  }

  proc.kill('SIGKILL');
}

export function spawnEnd(spawnObservable: Observable<SpawnChunk>) {
  const sbj = new Subject<ExecOutput>();

  const stdouts: Buffer[] = [];
  const stderrs: Buffer[] = [];

  spawnObservable.subscribe(
    chunk => {
      if (chunk.type === 'stdout') {
        stdouts.push(chunk.chunk);
      } else {
        stderrs.push(chunk.chunk);
      }
    },
    err => sbj.error(err),
    () =>
      sbj.next({stdout: Buffer.concat(stdouts), stderr: Buffer.concat(stderrs)})
  );

  return sbj;
}

export class ShellError extends Error {
  constructor(
    public message: string,
    public code?: string,
    public stdout?: string | Buffer,
    public stderr?: string | Buffer,
    public originError?: any
  ) {
    super(message);
  }
}

export function listenTerminating(
  fn: (signal: number) => any,
  events: NodeJS.Signals[] = ['SIGINT', 'SIGBREAK']
): () => void {
  events.forEach(name => process.on(name, fn));
  process.on('exit', fn);

  return () => {
    events.forEach(name => process.off(name, fn));
    process.off('exit', fn);
  };
}
