import React, {useEffect} from 'react';
import {getElementInfo} from 'src/pages/drag-page/util';
import {getComponentDisplayName} from 'src/pages/drag-page-old/component-config';
import s from './style.less';

export default React.memo(function DragGuide(props) {
    const {
        canvasDocument,
        draggingElement,
        targetElement,
        targetNode,
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
        if (!canvasDocument) return;
        const guideBgEle = canvasDocument.getElementById('drop-guide-bg');

        if (!targetElement) {
            guideBgEle.classList.remove(s.guideBgActive);
            return;
        }

        const componentDisplayName = getComponentDisplayName(targetNode);
        guideBgEle.setAttribute('data-component-display-name', componentDisplayName);
        guideBgEle.classList.add(s.guideBgActive);


        const {top, left, width, height} = getElementInfo(targetElement, {
            viewSize: true,
            documentElement: canvasDocument.documentElement,
        });

        guideBgEle.style.top = `${top + 1}px`;
        guideBgEle.style.left = `${left + 1}px`;
        guideBgEle.style.width = `${width - 2}px`;
        guideBgEle.style.height = `${height - 2}px`;
    }, [targetNode, targetElement, draggingElement, canvasDocument]);

    return null;
});
