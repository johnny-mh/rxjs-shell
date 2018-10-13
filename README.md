# rxjs-shell

![travisci](https://travis-ci.org/johnny-mh/rxjs-shell.svg?branch=master)

rxjs operators for execute shell command with ease.

## Features

- Wrap nodejs asynchronous process creation methods to rxjs Observable.
- Kill child process when unsubscribed.
- Use subject to communicate with child process.

## Functions

### exec(command[, options]) → Observable\<string\> 

- `options` interface is same with nodejs `exec` method

```typescript
import {exec} from 'rxjs-shell';

exec('echo Hello World')
  .subscribe(output => {
    console.log(output); // Hello World\n
  });
```

### execFile(file[, args][, options]) → Observable\<string\>

- `options` interface is same with nodejs `execFile` method

```typescript
import {existSync} from 'fs';
import {execFile} from 'rxjs-shell';

execFile('./touchFile.sh')
  .subscribe(() => {
    console.log(existSync('touched.txt')); // true
  });
```

### spawn(command[, args][, options]) → Observable\<Buffer\>

- `spawn` emits `stdout`, `stderr`'s buffer from command execution.
- `options` interface is same with nodejs `spawn` method

```typescript
import {spawn} from 'rxjs-shell';

spawn('git clone http://github.com/johnny-mh/rxjs-shell-operators')
  .pipe(tap(buf => process.stdout.write(String(buf))))
  .subscribe();
```

### fork(modulePath[, args][, options]) → Observable\<Buffer\>

- same with `spawn` but have own `options` interface that extend nodejs fork options to communicate with child process.

```typescript
import {fork} from 'rxjs-shell';
import {Subject} from 'rxjs';

const send = new Subject<string>();
const recv = new Subject<string>();

recv.subscribe(msgFromChildProc => console.log(msgFromChildProc));

fork('echo.js', undefined, {send, recv}).subscribe();

send.next('message to child process');
```

## Operators

### trim(encoding = 'utf8') → Observable\<string | Buffer\>

- trim child process output

```typescript
import {exec, trim} from 'rxjs-shell';

exec('echo Hello').subscribe(output => console.log(output)); // Hello\n

exec('echo Hello').pipe(trim()).subscribe(output => console.log(output)); // Hello
```

### print → Observable\<string | Buffer\>

- syntax sugar of `tap(buf => process.stdout.write(buf))`

## Utility Methods

### spawnEnd(spawnObservable: Observable<any>) → Subject\<void\>

- `spawn` emit each buffer from child process. if you want to connect other operator to this stream. use `spawnEnd` method.

```typescript
import {spawn, spawnEnd} from 'rxjs-shell';

spawn('webpack', ['-p'])
  .pipe(outputChunk => { /* each child process's output buffer */ })
  .subscribe();

spawnEnd(spawn('webpack', ['-p']))
  .pipe(webpackOutput => { /* do something */ })
  .subscribe();
```
