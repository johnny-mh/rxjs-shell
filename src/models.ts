export interface SpawnChunk {
  type: 'stdout' | 'stderr';
  chunk: Buffer;
}

export function isSpawnChunk(obj: any): obj is SpawnChunk {
  return !!obj && typeof obj.type === 'string' && Buffer.isBuffer(obj.chunk);
}

export interface ExecOutput {
  stdout: string | Buffer;
  stderr: string | Buffer;
}

export function isExecOutput(obj: any): obj is ExecOutput {
  return (
    !!obj &&
    (Buffer.isBuffer(obj.stdout) || typeof obj.stdout === 'string') &&
    (Buffer.isBuffer(obj.stderr) || typeof obj.stderr === 'string')
  );
}
