# rxjs-shell

[![PR Build](https://github.com/johnny-mh/rxjs-shell/actions/workflows/pull_request.yml/badge.svg)](https://github.com/johnny-mh/rxjs-shell/actions/workflows/pull_request.yml)

rxjs operators for execute shell command with ease.

## Features

- Wrap nodejs asynchronous process creation methods to rxjs Observable.
- Kill child process when unsubscribed.
- Use subject to communicate with child process.

## Functions

### exec(command[, options][, proccallback]) → Observable\<{stdout: string | Buffer, stderr: string | Buffer}\>

- `options` interface is same with nodejs `exec` method
- `procCallback` you can pass function. <code>?[ChildProcess](https://nodejs.org/dist/latest-v16.x/docs/api/child_process.html#class-childprocess)</code> will be passed first argument.

```typescript
import {exec} from 'rxjs-shell';

exec('echo Hello World').subscribe(output => {
  console.log(output.stdout.toString('utf8')); // Hello World\n
});


// using `procCallback`
exec('cat -', undefined, proc => {
  proc.stdin?.write('Hello World');
  proc.stdin?.end(); // it may cause endless process if you don't handle right.
}).subscribe(output => { /* ... */ })
```

### execFile(file[, args][, options]) → Observable\<{stdout: string | Buffer, stderr: string | Buffer}\>

- `options` interface is same with nodejs `execFile` method

```typescript
import {existSync} from 'fs';
import {execFile} from 'rxjs-shell';
execFile('./touchFile.sh').subscribe(() => {
  console.log(existSync('touched.txt')); // true
});
```

### spawn(command[, args][, options][, procCallback]) → Observable\<{type: 'stdout' | 'stderr', chunk: Buffer}\>

- `spawn` emits `stdout`, `stderr`'s buffer from command execution.
- `options` interface is same with nodejs `spawn` method
- `procCallback` you can pass function. `ChildProcessWithoutNullStreams` will be passed first argument.

```typescript
import {spawn} from 'rxjs-shell';

spawn('git clone http://github.com/johnny-mh/rxjs-shell-operators')
  .pipe(tap(chunk => process.stdout.write(String(chunk.chunk))))
  .subscribe();

// using `procCallback`
spawn('cat', ['-'], undefined, proc => {
  proc.stdin.write('hello world');
  proc.stdin.end(); // caution
}).subscribe(output => { /* ... */ });
```

### fork(modulePath[, args][, options]) → Observable\<Serializable\>

- same with `spawn` but have own `options` interface that extend nodejs's `fork` options to communicate with child process.

```typescript
import {Subject} from 'rxjs';
import {fork} from 'rxjs-shell';

const send = new Subject<string>();

fork('echo.js', undefined, {send}).subscribe(msgFromChildProc =>
  console.log(msgFromChildProc)
);

send.next('message to child process');
```

## Operators

### trim(encoding = 'utf8')

- trim child process output

```typescript
import {exec, trim} from 'rxjs-shell';

exec('echo Hello').subscribe(output => console.log(output.stdout.toString())); // Hello\n

exec('echo Hello')
  .pipe(trim())
  .subscribe(output => console.log(output.stdout.toString())); // Hello
```

### throwIf(pattern: string | RegExp)

- manually throw error if contents of `stdout` or `stderr` is matching supplied pattern

```typescript
import {throwIf} from 'rxjs-shell';

exec('echo Hello').pipe(throwIf(/Hello/)).subscribe(); // ERROR
```

### throwIfStdout(pattern: string | RegExp)

- manually throw error if contents of `stdout` is matching supplied pattern

```typescript
import {throwIfStdout} from 'rxjs-shell';

exec('echo Hello').pipe(throwIfStdout(/Hello/)).subscribe(); // ERROR
exec('>&2 echo Hello').pipe(throwIfStdout(/Hello/)).subscribe(); // OK
```

### throwIfStderr(pattern: string | RegExp)

- manually throw error if contents of `stderr` is matching supplied pattern

```typescript
import {throwIfStderr} from 'rxjs-shell';

exec('echo Hello').pipe(throwIfStderr(/Hello/)).subscribe(); // OK
exec('>&2 echo Hello').pipe(throwIfStderr(/Hello/)).subscribe(); // ERR
```

### execWithStdin(command)

- executes a command with a string event as stdin input

```typescript
of('Hello World')
  .pipe(execWithStdin('cat -'))
  .subscribe(output => {
    expect(String(output.stdout).trim()).to.equal('Hello World');
  });
```

## Utility Methods

### spawnEnd(spawnObservable: Observable<any>) → Subject\<{stdout: Buffer, stderr: Buffer}\>

- `spawn` emit each buffer from child process. if you want to connect other operator to this stream. use `spawnEnd` method.

```typescript
import {spawn, spawnEnd} from 'rxjs-shell';

spawn('webpack', ['-p'])
  .pipe(outputChunk => {
    /* each child process's output buffer */
  })
  .subscribe();

spawnEnd(spawn('webpack', ['-p']))
  .pipe(webpackOutput => {
    /* do something */
  })
  .subscribe();
```

### listenTerminating(fn: () => any)

- invoke callbacks when one of signals that below is emitted.
  - `SIGINT`
  - `SIGBREAK` (for windows)

basically each operators are listen that. if user pressed `^C` below stream is unsubscribe immediatly.

```typescript
exec('curl ...')
  .pipe(concatMap(() => exec('curl ...')))
  .subscribe();
```

but if operators are not tied of one stream. whole process does not terminate. in this case. you can use `listenTerminating`.

```typescript
import {exec, listenTerminating} from 'rxjs-shell';

// terminate process
listenTerminating(code => process.exit(code));
async () => {
  // user pressing ^C while curl is running
  await exec('curl ...').toPromise();

  // execute despite of pressing ^C. needs `listenTerminating`
  await exec('curl -X POST ...').toPromise();
};
```

## isSpawnChunk(obj: any): obj is SpawnChunk

## isExecOutput(obj: any): obj is ExecOutput

## Error Handling

```typescript
import {ShellError, spawn} from 'rxjs-shell';

spawn('git clone http://github.com/johnny-mh/rxjs-shell-operators')
  .pipe(tap(chunk => process.stdout.write(String(chunk.chunk))))
  .subscribe({
    catch(err) {
      if (!(err instanceof ShellError)) {
        throw err;
      }

      console.log(err.originError);
      console.log(err.stdout);
      console.log(err.stderr);
      console.log(err.toAnnotatedString()); // print annotated errors
    },
  });
```

## FAQ

### Operator does not throw script error

Some shell script doesn't completed with Non-Zero code. they just emitting error message to `stderr` or `stdout` 😢. If so. hard to throw `ShellError` because of `err` is `null`. You can use `throwIf`, `throwIfStdout`, `throwIfStderr` operator manually throwing specific scripts.

```typescript
exec('sh a.sh')
  .pipe(concatMap(() => exec('sh b.sh').pipe(throwIf(/ERROR:/))))
  .subscribe();
```
