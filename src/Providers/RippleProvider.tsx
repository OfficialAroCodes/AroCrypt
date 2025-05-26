import React, { useEffect } from 'react';

const RippleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useEffect(() => {
        function addRippleEffect(element: HTMLElement) {
            element.removeEventListener("pointerdown", handleRipple);
            element.addEventListener("pointerdown", handleRipple);
        }

        function handleRipple(mouseEvent: PointerEvent) {
            const element = mouseEvent.currentTarget as HTMLElement;
            var rect = element.getBoundingClientRect();
            var { clientX, clientY } = mouseEvent;
            var x = clientX - rect.left;
            var y = clientY - rect.top;
            var rippleEl = createRippleElement(x, y);
            element.appendChild(rippleEl);
            requestAnimationFrame(() => rippleEl.classList.add("run"));
            rippleEl.addEventListener("transitionend", () => rippleEl.remove());
        }

        function createRippleElement(x: number, y: number) {
            var rippleEl = document.createElement("div");
            rippleEl.classList.add("ripple");
            rippleEl.style.left = `${x}px`;
            rippleEl.style.top = `${y}px`;
            return rippleEl;
        }

        function applyRippleEffects() {
            const elementsWithRipple = document.querySelectorAll(".re");
            elementsWithRipple.forEach((elementWithRipple) =>
                addRippleEffect(elementWithRipple as HTMLElement)
            );
        }

        applyRippleEffects();

        const observer = new MutationObserver(applyRippleEffects);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return () => {
            observer.disconnect();
            const elementsWithRipple = document.querySelectorAll(".re");
            elementsWithRipple.forEach((element) => {
                element.removeEventListener('pointerdown', handleRipple as EventListener);
            });
        };
    }, []);

    return <>{children}</>;
};

export default RippleProvider;
