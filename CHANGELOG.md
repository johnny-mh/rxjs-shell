# 2.0.0 (2020-04-08)

- add `throwIf`, `throwIfStdout`, `throwIfStderr` operators to throw error manually.

### Breaking Changes

- `trim` keep `ExecOutput` properties type. if type of stdout is `Buffer` output type is `Buffer`. if `string` output is `string`.

# 1.0.4 (2020-03-26)

- all methods cancel process when following signals and events generated. `SIGINT`, `SIGUSR1`, `SIGUSR2`, `SIGTERM`, `exit`, `uncaughtException`.
- change `fork`, `spawn` seconds parameter of methods for convenience. now accept `any[]`. casting internally.
- fix security vulnerabilities

# 1.0.3 (2020-01-17)

- fix security vulnerabilities

# 1.0.2 (2019-09-04)

- add error handling example

# 1.0.1 (2019-09-02)

- fix security vulnerabilities

# 1.0.0 (2018-12-15)

- no changes. just update version

# 0.0.7 (2018-10-24)

- enhance `ShellError` data.
- `spawnEnd` now emit `ExecOutput` of `spawn` results.

### Breaking Changes

- `spawn` emit `SpawnChunk` type. no `Buffer`.
- `exec`, `execFile` emit `ExecOutput` type. no `string`
- `fork` emit child process's message. no `string | Buffer`.
- deleted `fork` method's `recv` option. messages from child process will emit subscription.

# 0.0.6

- not use

# 0.0.5 (2018-10-18)

- create `ShellError` class for throw shell errors.
- `operators/print` operator deprecated. (use `{stdio: 'inherit'}` instead)

# 0.0.4 (2018-10-13)

- change function name `operators/printBuf` to `operators/print`.

# 0.0.3 (2018-10-13)

- change package name to `rxjs-shell`

### Features

- add `util/spawnEnd`: to know when `spawn` stream completed.
- add `operators/trim`: trim output buffer or string contents.
- add `operators/printBuf`: syntax sugar of `tap(buf => process.stdout.write(buf))`.

# [0.0.2](https://github.com/johnny-mh/rxjs-shell-operators/commit/d249d3570dcc6d87d200aae4570c621a90aafdeb) (2018-10-10)

