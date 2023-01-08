# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [3.1.3](https://github.com/johnny-mh/rxjs-shell/compare/v3.1.2...v3.1.3) (2023-01-08)

### [3.1.2](https://github.com/johnny-mh/rxjs-shell/compare/v3.1.1...v3.1.2) (2021-12-15)


### Bug Fixes

* export newly added operator ([df84495](https://github.com/johnny-mh/rxjs-shell/commit/df844956f5f1541713641eb61944a17beaad59a5))

### [3.1.1](https://github.com/johnny-mh/rxjs-shell/compare/v3.1.0...v3.1.1) (2021-12-15)

## [3.1.0](https://github.com/johnny-mh/rxjs-shell/compare/v3.0.8...v3.1.0) (2021-12-15)


### Features

* add execWithStdin operator ([04cd51c](https://github.com/johnny-mh/rxjs-shell/commit/04cd51c5c20459f7ddc045fa3dfb1e57759ff551))
* add procCallback to spawn function ([04f01a2](https://github.com/johnny-mh/rxjs-shell/commit/04f01a2c39a8d88ba48481fefb9b971e15a07cb9))

### [3.0.8](https://github.com/johnny-mh/rxjs-shell/compare/v3.0.7...v3.0.8) (2021-12-13)

### [3.0.7](https://github.com/johnny-mh/rxjs-shell/compare/v3.0.6...v3.0.7) (2021-05-29)

### [3.0.5](https://github.com/johnny-mh/rxjs-shell/compare/v3.0.4...v3.0.5) (2020-10-06)


### Bug Fixes

* change type of ShellError~originError to solve wrong build issue ([#18](https://github.com/johnny-mh/rxjs-shell/issues/18)) ([34e2081](https://github.com/johnny-mh/rxjs-shell/commit/34e2081847905224adcab4a145b288fef09e5815))

### [3.0.4](https://github.com/johnny-mh/rxjs-shell/compare/v3.0.3...v3.0.4) (2020-08-15)

### [3.0.3](https://github.com/johnny-mh/rxjs-shell/compare/v3.0.2...v3.0.3) (2020-07-14)


### Bug Fixes

* bump standard-version from 8.0.0 to 8.0.1 ([50cc9c4](https://github.com/johnny-mh/rxjs-shell/commit/50cc9c426114933acd1b92ba8dbd22617a1b3aae))

### [3.0.2](https://github.com/johnny-mh/rxjs-shell/compare/v3.0.1...v3.0.2) (2020-07-07)


### Bug Fixes

* export interfaces and guards (`SpawnChunk`, `isSpawnChunk`, `ExecOutput`, `isExecOutput`) ([c058179](https://github.com/johnny-mh/rxjs-shell/commit/c0581795b55a97fa9aaf0a63408e993ea9984f73))

### [3.0.1](https://github.com/johnny-mh/rxjs-shell/compare/v3.0.0...v3.0.1) (2020-07-06)


### Bug Fixes

* using `SpawnOptions` instead of `SpawnOptionsWithoutStdio` ([70530fd](https://github.com/johnny-mh/rxjs-shell/commit/70530fd251ec212169a12bcacbefbd7d3559c04a))

## [3.0.0](https://github.com/johnny-mh/rxjs-shell/compare/v2.1.2...v3.0.0) (2020-07-06)

### Features

* chore: using yarn, eslint, commitlint, standard-version
    
* feat: adding `toAnnotatedString` method to `ShellError`

You can print annotated error message for debugging purpose. Guessing error is hard before.

### ⚠ BREAKING CHANGES

* `ShellError` class property `code` removed. you can use `originError`

### [2.1.2](https://github.com/johnny-mh/rxjs-shell/compare/v2.0.0...v2.1.2) (2020-07-06)


### Features

* exporting `listenTerminating` ([a74cab8](https://github.com/johnny-mh/rxjs-shell/commit/a74cab89a4395985c05bea8d0d499d4422699e44))


### Bug Fixes

* `listenTerminating` callback parameter type ([c78fc86](https://github.com/johnny-mh/rxjs-shell/commit/c78fc8685917c41f6126400a1fdfb9e4db523ca1))
* `listenTerminating` listen `SIGINT`, `SIGBREAK` only ([8f7d9b2](https://github.com/johnny-mh/rxjs-shell/commit/8f7d9b2e67fde15427ff951bf61b9c620cc8f12d))

# 2.1.2 (2020-06-11)

- change `listenTerminating` callback parameter type

# 2.1.1 (2020-06-11)

- change `listenTerminating` listen `SIGINT`, `SIGBREAK` only.

# 2.1.0 (2020-06-10)

- export `listenTerminating` to terminating whole process

# 2.0.0 (2020-04-08)

- add `throwIf`, `throwIfStdout`, `throwIfStderr` operators to throw error manually ([#11](https://github.com/johnny-mh/rxjs-shell/issues/11))

### Breaking Changes

- `trim` keep `ExecOutput` properties type. if type of stdout is `Buffer` output type is `Buffer`. if `string` output is `string`

# 1.0.4 (2020-03-26)

- all methods cancel process when following signals and events generated. `SIGINT`, `SIGUSR1`, `SIGUSR2`, `SIGTERM`, `exit`, `uncaughtException` ([#9](https://github.com/johnny-mh/rxjs-shell/issues/9))
- change `fork`, `spawn` seconds parameter of methods for convenience. now accept `any[]`. casting internally
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

- enhance `ShellError` data
- `spawnEnd` now emit `ExecOutput` of `spawn` results

### Breaking Changes

- `spawn` emit `SpawnChunk` type. no `Buffer`
- `exec`, `execFile` emit `ExecOutput` type. no `string`
- `fork` emit child process's message. no `string | Buffer`
- deleted `fork` method's `recv` option. messages from child process will emit subscription

# 0.0.6

- not use

# 0.0.5 (2018-10-18)

- create `ShellError` class for throw shell errors
- `operators/print` operator deprecated. (use `{stdio: 'inherit'}` instead)

# 0.0.4 (2018-10-13)

- change function name `operators/printBuf` to `operators/print`

# 0.0.3 (2018-10-13)

- change package name to `rxjs-shell`

### Features

- add `util/spawnEnd`: to know when `spawn` stream completed
- add `operators/trim`: trim output buffer or string contents
- add `operators/printBuf`: syntax sugar of `tap(buf => process.stdout.write(buf))`

# [0.0.2](https://github.com/johnny-mh/rxjs-shell-operators/commit/d249d3570dcc6d87d200aae4570c621a90aafdeb) (2018-10-10)
