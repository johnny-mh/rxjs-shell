import {EventEmitter} from 'events';
import {createSandbox, SinonSandbox} from 'sinon';

export class MockProcessEvent {
  private emitter: EventEmitter;
  private sandbox: SinonSandbox;

  constructor() {
    this.emitter = new EventEmitter();
    this.sandbox = createSandbox();

    this.sandbox
      .stub(process, 'on')
      .callsFake((name: string, fn: any) => this.emitter.on(name, fn) as any);
  }

  emit(eventName: string) {
    this.emitter.emit(eventName);
  }

  destroy() {
    this.sandbox.restore();
  }
}
