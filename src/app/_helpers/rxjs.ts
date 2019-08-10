import {BehaviorSubject, Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

const _dontPublish = {};


export function shareLast<T>(obs: Observable<T>): Observable<T> {
    const subs = new BehaviorSubject<T|{}>(_dontPublish);
    obs.subscribe((data) => {
        subs.next(data);
    });
    // tslint:disable-next-line:triple-equals
    return <Observable<T>>subs.pipe(filter(x => x != _dontPublish));
}
