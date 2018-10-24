export interface SpawnChunk {
  type: 'stdout' | 'stderr';
  chunk: Buffer;
}

export interface ExecOutput {
  stdout: string | Buffer;
  stderr: string | Buffer;
}

export const RXJS_SHELL_ERROR = 'RXJS_SHELL_ERROR';
