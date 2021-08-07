export const isMac = /macintosh|mac os x/i.test(navigator.userAgent);

// 元素是否在可视窗口内
export function elementIsVisible(containerEle, element) {
    if (!element || !containerEle) return {};

    const containerHeight = containerEle.clientHeight;
    const containerScrollTop = containerEle.scrollTop;
    const elementRect = element.getBoundingClientRect();
    const containerRect = containerEle.getBoundingClientRect();
    const {y, height: elementHeight} = elementRect;
    const elementTop = y - containerRect.y + containerScrollTop;

    const elementBottom = elementTop + elementHeight;
    const containerShownHeight = containerScrollTop + containerHeight;

    // 可见
    const visible = !(elementTop > containerShownHeight
        || elementBottom < containerScrollTop);

    return {
        visible,
        elementTop,
        elementBottom,
        containerHeight,
        containerScrollTop,
        containerShownHeight,
    };

}

/**
 * 滚动元素到可视窗口内
 * @param containerEle 元素容器
 * @param element 需要滚动的元素
 * @param toTop 滚动到顶部
 * @param force 元素是否可见都滚动
 * @param offsetTop 滚动到顶部偏移距离
 */
export function scrollElement(containerEle, element, toTop, force, offsetTop = 0) {
    if (!element) return;

    const {
        visible,
        elementTop,
        containerHeight,
    } = elementIsVisible(containerEle, element);

    const scroll = () => {
        if (toTop) {
            // 滚动到顶部
            containerEle.scrollTop = elementTop + offsetTop;
        } else {
            // 滚动到中间
            containerEle.scrollTop = elementTop - containerHeight / 2 + offsetTop;
        }
    };

    if (force) {
        scroll();
        return;
    }
    // 非可见
    if (!visible) {
        scroll();
    }
}
