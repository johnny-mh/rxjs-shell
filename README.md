# rxjs-shell

![travisci](https://travis-ci.org/johnny-mh/rxjs-shell.svg?branch=master)

rxjs operators for execute shell command with ease.

## Features

- Wrap nodejs asynchronous process creation methods to rxjs Observable.
- Kill child process when unsubscribed.
- Use subject to communicate with child process.

## Functions

### exec(command[, options]) → Observable\<{stdout: string | Buffer, stderr: string | Buffer}\> 

- `options` interface is same with nodejs `exec` method

```typescript
import {exec} from 'rxjs-shell';

exec('echo Hello World')
  .subscribe(output => {
    console.log(output.stdout.toString('utf8')); // Hello World\n
  });
```

### execFile(file[, args][, options]) → Observable\<{stdout: string | Buffer, stderr: string | Buffer}\>

- `options` interface is same with nodejs `execFile` method

```typescript
import {existSync} from 'fs';
import {execFile} from 'rxjs-shell';

execFile('./touchFile.sh')
  .subscribe(() => {
    console.log(existSync('touched.txt')); // true
  });
```

### spawn(command[, args][, options]) → Observable\<{type: 'stdout' | 'stderr', chunk: Buffer}\>

- `spawn` emits `stdout`, `stderr`'s buffer from command execution.
- `options` interface is same with nodejs `spawn` method

```typescript
import {spawn} from 'rxjs-shell';

spawn('git clone http://github.com/johnny-mh/rxjs-shell-operators')
  .pipe(tap(chunk => process.stdout.write(String(chunk.chunk))))
  .subscribe();
```

### fork<T = any>(modulePath[, args][, options]) → Observable\<T\>

- same with `spawn` but have own `options` interface that extend nodejs's `fork` options to communicate with child process.

```typescript
import {fork} from 'rxjs-shell';
import {Subject} from 'rxjs';

const send = new Subject<string>();

fork('echo.js', undefined, {send}).subscribe(msgFromChildProc => console.log(msgFromChildProc));

send.next('message to child process');
```

## Operators

### trim(encoding = 'utf8')

- trim child process output

```typescript
import {exec, trim} from 'rxjs-shell';

exec('echo Hello').subscribe(output => console.log(output.stdout.toString())); // Hello\n

exec('echo Hello').pipe(trim()).subscribe(output => console.log(output.stdout.toString())); // Hello
```

## Utility Methods

### spawnEnd(spawnObservable: Observable<any>) → Subject\<{stdout: Buffer, stderr: Buffer}\>

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

## Error Handling

```typescript
import {spawn, ShellError} from 'rxjs-shell';

spawn('git clone http://github.com/johnny-mh/rxjs-shell-operators')
  .pipe(tap(chunk => process.stdout.write(String(chunk.chunk))))
  .subscribe({
    catch(err) {
      if (!(err instanceof ShellError)) {
        throw err;
      }

      console.log(err.stdout);
      console.log(err.stderr);
      console.log(err.message);
      console.log(err.code);
      console.log(err.originError);
    }
  });
```