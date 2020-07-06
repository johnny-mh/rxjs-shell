import {EventEmitter} from 'events';

import {SinonSandbox, createSandbox} from 'sinon';

export class MockProcessEvent {
  private emitter: EventEmitter;
  private sandbox: SinonSandbox;

  constructor() {
    this.emitter = new EventEmitter();
    this.sandbox = createSandbox();

    this.sandbox
      .stub(process, 'on')
      .callsFake((name: any, fn: any) => this.emitter.on(name, fn) as any);
  }

  emit(eventName: string) {
    this.emitter.emit(eventName);
  }

  destroy() {
    this.sandbox.restore();
  }
}
