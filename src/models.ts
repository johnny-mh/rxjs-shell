export interface SpawnChunk {
  type: 'stdout' | 'stderr';
  chunk: Buffer;
}

export interface ExecOutput {
  stdout: string | Buffer;
  stderr: string | Buffer;
}
