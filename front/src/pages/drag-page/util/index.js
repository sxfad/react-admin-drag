export const isMac = /macintosh|mac os x/i.test(navigator.userAgent);

/**
 * 获取元素在可视窗口内位置、尺寸、滚动等信息
 * @param element
 * @returns {{top: number, left: number, bottom: number, width: number, right: number, scrollTop, height: number}}
 */
export function getElementInfo(element) {
    const rect = element.getBoundingClientRect();
    const scrollTop = element.scrollTop;

    return {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        scrollTop,
    };
}

/**
 * 元素在容器组件中是否可见
 * @param element
 * @param container
 */
export function isElementVisible(container = document.body, element) {
    const elementInfo = getElementInfo(element);
    const containerInfo = getElementInfo(container);

    return (elementInfo.top > containerInfo.top && elementInfo.top < containerInfo.bottom)
        || (elementInfo.bottom < containerInfo.bottom && elementInfo.bottom > containerInfo.top);
}


/**
 * 滚动元素到可视窗口内
 * @param container 元素容器
 * @param element 需要滚动的元素
 * @param toTop 滚动到顶部，默认滚动到容器中间位置
 * @param force 元素是否可见都滚动
 * @param offsetTop 滚动到顶部偏移距离
 */
export function scrollElement(container, element, toTop, force, offsetTop = 0) {
    if (!element) return;

    const visible = isElementVisible(container, element);
    const elementInfo = getElementInfo(element);
    const containerInfo = getElementInfo(container);

    // 元素顶部距离容器顶部的距离
    const elementTopInContainer = elementInfo.top - containerInfo.top + containerInfo.scrollTop;
    const containerHeight = containerInfo.height;
    const scrollTop = toTop ? elementTopInContainer + offsetTop : elementTopInContainer - containerHeight / 2 + offsetTop;

    if (force) {
        // 是否可见都滚动
        container.scrollTop = scrollTop;
    } else if (!visible) {
        // 只有非可见情况下才滚动
        container.scrollTop = scrollTop;
    }
}
