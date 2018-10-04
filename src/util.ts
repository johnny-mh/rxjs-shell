import {ChildProcess} from 'child_process';

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
