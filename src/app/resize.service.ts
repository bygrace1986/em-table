import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { debounceTime, map, distinctUntilChanged, shareReplay, startWith } from 'rxjs/operators';

export enum Breakpoint {
    xs,
    sm,
    md,
    lg,
    xl
}

/**
 * List of breakpoints with their associated minimum value.
 * Listed in descending order since we will eveluate the largest first.
 */
const breakpoints = [
    { min: 1200, value: Breakpoint.xl },
    { min: 992, value: Breakpoint.lg },
    { min: 768, value: Breakpoint.md },
    { min: 576, value: Breakpoint.sm },
    { min: 0, value: Breakpoint.xs }
];

/**
 * Service used to abstract resize events into breakpoint categories.
 * Also reduces the unecessary processing of multiple resize listeners
 * and granular events.
 * @export
 * @class ResizeService
 */
@Injectable()
export class ResizeService {
    public resize = new Subject<void>();
    public breakpoint: Observable<Breakpoint> = this.resize.pipe(
        startWith(null),
        debounceTime(10), // to avoid unnecessary churn
        map(() => breakpoints.find(breakpoint => window.matchMedia(`(min-width: ${breakpoint.min}px)`).matches).value),
        distinctUntilChanged(),
        shareReplay(1)
    );
}
