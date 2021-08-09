import React, {useEffect} from 'react';
import s from './style.less';

export default React.memo(function DragGuide(props) {
    const {
        draggingElement,
        targetElement,
    } = props;

    // 正在拖拽中的节点添加毛玻璃样式
    useEffect(() => {
        if (!draggingElement) return;

        draggingElement.classList.add(s.dragging);
        return () => {
            draggingElement.classList.remove(s.dragging);
        };

    }, [draggingElement]);

    // 投放目标元素样式
    useEffect(() => {
        if (!targetElement) return;
        console.log(targetElement);

    }, [targetElement]);

    return null;
});
