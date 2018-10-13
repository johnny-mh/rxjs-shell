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
