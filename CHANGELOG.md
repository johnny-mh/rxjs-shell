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

