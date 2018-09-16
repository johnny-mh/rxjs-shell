import { spawn as nodeSpawn } from 'child_process';
import { Subject } from 'rxjs';

export function spawn(command: string) {
  const sbj = new Subject();

  Promise.resolve().then(() => {
    const [bin, args] = command.split(' ');
    const proc = nodeSpawn(bin, [args]);

    proc.on('close', (code: number) => {
      console.log(code);
      sbj.next();
      sbj.complete();
    });
  });

  return sbj;
}
