import { useEffect, useRef } from "react";

const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step))

export const useEventListener = (eventName, callback, element) => {
    const savedCallback = useRef<Function>();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(
        () => {
            const isSupported = element && element.addEventListener;
            if (!isSupported) return;

            const eventListener = (event) => savedCallback.current(event);

            element.addEventListener(eventName, eventListener);

            return () => {
                element.removeEventListener(eventName, eventListener);
            };
        },
        [eventName, element]
    );
}

export const useInterval = (callback: Function, delay?: number | null) => {
    const savedCallback = useRef<Function>();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        function tick() {
            if (savedCallback && savedCallback.current) {
                savedCallback.current();
            }
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

export const useAnimationFrame = (callback: Function) => {
    const savedCallback = useRef<Function>();
    const requestRef = useRef<any>();
    const previousTimeRef = useRef<number>();
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    const animate = async time => {

        if (previousTimeRef.current != undefined) {
            await savedCallback.current();
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    }

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);
}
