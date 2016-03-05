import xs from '../../src/index';
import * as assert from 'assert';

class FakeEventTarget implements EventTarget {
  public handler: EventListener;
  public event: string;
  public capture: boolean;
  public removedEvent: string;
  public removedCapture: boolean;

  constructor() {}

  emit(x: any) {
    if (typeof this.handler !== 'function') {
        return;
    }
    this.handler.call(void 0, x);
  }

  addEventListener(e: string, handler: EventListener, capture: boolean) {
    this.event = e;
    this.handler = handler;
    this.capture = capture;
  }

  removeEventListener(e: string, handler: EventListener, capture: boolean) {
    this.removedEvent = e;
    this.removedCapture = capture;

    this.handler = this.event = this.capture = void 0;
  }

  dispatchEvent(event: Event) {
    return true;
  }
};

describe('xs.domEvent', () => {
  it('should call addEventListener with expected parameters', () => {
    const target = new FakeEventTarget();
    const stream = xs.domEvent(target, 'test', true);

    stream.subscribe({next: () => {}, error: () => {}, end: () => {}});

    assert.strictEqual('test', target.event);
    assert.strictEqual(true, target.capture);
  });

  it('should call addEventListener with expected parameters', () => {
    const target = new FakeEventTarget();
    const stream = xs.domEvent(target, 'test');

    stream.subscribe({next: () => {}, error: () => {}, end: () => {}});

    assert.strictEqual('test', target.event);
    assert.strictEqual(false, target.capture);
  });

  it('should propagate events', (done) => {
    const target = new FakeEventTarget();
    const stream = xs.domEvent(target, 'test').take(3);

    let expected = [1, 2, 3];

    const observer = {
      next(x: any) {
        assert.strictEqual(x, expected.shift());
      },
      error: done.fail,
      end: () => {
        assert.strictEqual(expected.length, 0);
        done();
      }
    };

    stream.subscribe(observer);

    target.emit(1);
    target.emit(2);
    target.emit(3);
    target.emit(4);
  });

  it('should call removeEventListener with expected parameters', (done) => {
    const target = new FakeEventTarget();
    const stream = xs.domEvent(target, 'test', true);

    stream.take(1).subscribe({
      next(x) {},
      error: done.fail,
      end() {
        setTimeout(() => {
          assert.strictEqual('test', target.removedEvent);
          assert.strictEqual(true, target.removedCapture);
          done();
        }, 5);
      }
    });

    target.emit(1);
    target.emit(2);
  });
});