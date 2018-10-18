import {ChildProcess} from 'child_process';
import {Observable, Subject} from 'rxjs';

export function killProc(proc: ChildProcess) {
  if (proc.stdout) {
    proc.stdout.removeAllListeners();
  }

  if (proc.stderr) {
    proc.stderr.removeAllListeners();
  }

  proc.removeAllListeners();
  proc.kill('SIGKILL');
}

export function spawnEnd(spawnObservable: Observable<any>) {
  const sbj = new Subject<void>();

  spawnObservable.subscribe(undefined, err => sbj.error(err), () => sbj.next());

  return sbj;
}

export class ShellError extends Error {
  constructor(
    public message: string,
    public originError: any,
    public stdout?: string | Buffer,
    public stderr?: string | Buffer
  ) {
    super(message);
  }

  toString() {
    let message = `${this.message}: `;
    const {stdout, stderr} = this;

    if (typeof stdout !== 'undefined' && stdout.length > 0) {
      message += `${(Buffer.isBuffer(stdout)
        ? stdout.toString('utf8')
        : stdout
      ).trim()}`;
    }

    if (typeof stderr !== 'undefined' && stderr.length > 0) {
      message += `${(Buffer.isBuffer(stderr)
        ? stderr.toString('utf8')
        : stderr
      ).trim()}`;
    }

    return message;
  }
}
