import {Observable, Subject, Subscriber} from 'rxjs';
import {map} from 'rxjs/operators';

export function trim<T>(encoding = 'utf8') {
  return function trimImplementation(source: Observable<T>): Observable<T> {
    return Observable.create((subscriber: any) => {
      const subscription = source.subscribe(
        value => {
          try {
            if (Buffer.isBuffer(value)) {
              subscriber.next(new Buffer(String(value).trim(), encoding));
            } else if (typeof value === 'string') {
              subscriber.next(value.trim());
            } else {
              subscriber.next(value);
            }
          } catch (err) {
            subscriber.error(err);
          }
        },
        err => subscriber.error(err),
        () => subscriber.complete()
      );

      return subscription;
    });
  };
}
