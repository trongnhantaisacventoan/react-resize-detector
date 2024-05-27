import type { DebouncedFunc } from 'lodash';
import { Props } from './types';
export type PatchedResizeObserverCallback = DebouncedFunc<ResizeObserverCallback> | ResizeObserverCallback;
export declare const patchResizeCallback: (resizeCallback: ResizeObserverCallback, refreshMode: Props['refreshMode'], refreshRate: Props['refreshRate'], refreshOptions: Props['refreshOptions']) => PatchedResizeObserverCallback;
