import {useRef,useState,useMemo,useCallback,useEffect}from'react';import debounce from'lodash/debounce';import throttle from'lodash/throttle';const patchResizeCallback = (resizeCallback, refreshMode, refreshRate, refreshOptions) => {
    switch (refreshMode) {
        case 'debounce':
            return debounce(resizeCallback, refreshRate, refreshOptions);
        case 'throttle':
            return throttle(resizeCallback, refreshRate, refreshOptions);
        default:
            return resizeCallback;
    }
};function useResizeDetector({ skipOnMount = false, refreshMode, refreshRate = 1000, refreshOptions, handleWidth = true, handleHeight = true, targetRef, observerOptions, onResize } = {}) {
    const skipResize = useRef(skipOnMount);
    const [size, setSize] = useState({
        width: undefined,
        height: undefined
    });
    // we are going to use this ref to store the last element that was passed to the hook
    const [refElement, setRefElement] = useState((targetRef === null || targetRef === void 0 ? void 0 : targetRef.current) || null);
    // if targetRef is passed, we need to update the refElement
    // we have to use setTimeout because ref get assigned after the hook is called
    // in the future releases we are going to remove targetRef and force users to use ref returned by the hook
    if (targetRef) {
        setTimeout(() => {
            if (targetRef.current !== refElement) {
                setRefElement(targetRef.current);
            }
        }, 0);
    }
    // this is a memo that will be called every time the ref is changed
    // This proxy will properly call setState either when the ref is called as a function or when `.current` is set
    // we call setState inside to trigger rerender
    const refProxy = useMemo(() => new Proxy(node => {
        if (node !== refElement) {
            setRefElement(node);
        }
    }, {
        get(target, prop) {
            if (prop === 'current') {
                return refElement;
            }
            return target[prop];
        },
        set(target, prop, value) {
            if (prop === 'current') {
                setRefElement(value);
            }
            else {
                target[prop] = value;
            }
            return true;
        }
    }), [refElement]);
    const shouldSetSize = useCallback((prevSize, nextSize) => {
        if (prevSize.width === nextSize.width && prevSize.height === nextSize.height) {
            // skip if dimensions haven't changed
            return false;
        }
        if ((prevSize.width === nextSize.width && !handleHeight) ||
            (prevSize.height === nextSize.height && !handleWidth)) {
            // process `handleHeight/handleWidth` props
            return false;
        }
        return true;
    }, [handleWidth, handleHeight]);
    const resizeCallback = useCallback((entries) => {
        if (!handleWidth && !handleHeight)
            return;
        if (skipResize.current) {
            skipResize.current = false;
            return;
        }
        entries.forEach(entry => {
            const { width, height } = (entry === null || entry === void 0 ? void 0 : entry.contentRect) || {};
            setSize(prevSize => {
                if (!shouldSetSize(prevSize, { width, height }))
                    return prevSize;
                return { width, height };
            });
        });
    }, [handleWidth, handleHeight, skipResize, shouldSetSize]);
    const resizeHandler = useCallback(patchResizeCallback(resizeCallback, refreshMode, refreshRate, refreshOptions), [
        resizeCallback,
        refreshMode,
        refreshRate,
        refreshOptions
    ]);
    // on refElement change
    useEffect(() => {
        var _a, _b;
        let resizeObserver;
        if (refElement) {
            const w = (_b = (_a = refElement.ownerDocument) === null || _a === void 0 ? void 0 : _a.defaultView) !== null && _b !== void 0 ? _b : window;
            resizeObserver = new w.ResizeObserver(resizeHandler);
            resizeObserver.observe(refElement, observerOptions);
        }
        else {
            if (size.width || size.height) {
                setSize({ width: undefined, height: undefined });
            }
        }
        return () => {
            var _a, _b, _c;
            (_a = resizeObserver === null || resizeObserver === void 0 ? void 0 : resizeObserver.disconnect) === null || _a === void 0 ? void 0 : _a.call(resizeObserver);
            (_c = (_b = resizeHandler).cancel) === null || _c === void 0 ? void 0 : _c.call(_b);
        };
    }, [resizeHandler, refElement]);
    useEffect(() => {
        onResize === null || onResize === void 0 ? void 0 : onResize(size.width, size.height);
    }, [size]);
    return Object.assign({ ref: refProxy }, size);
}export{useResizeDetector};//# sourceMappingURL=index.esm.js.map
