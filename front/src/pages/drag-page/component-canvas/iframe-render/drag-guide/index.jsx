import React, {useEffect, useCallback} from 'react';
import {getComponentDisplayName} from 'src/pages/drag-page-old/component-config';
import s from './style.less';
import {getElementInfo} from 'src/pages/drag-page/util';

export default React.memo(function DragGuide(props) {
    const {
        canvasDocument,
        draggingElement,
        targetElement,
        targetElementSize,
        targetHoverPosition,
        targetNode,
        selectedNode,
    } = props;

    const showGuideBg = useCallback((targetElement, targetNode, targetElementSize) => {
        if (!canvasDocument) return;
        const guideBgEle = canvasDocument.getElementById('drop-guide-bg');
        if (!targetElement) {
            guideBgEle.classList.remove(s.guideBgActive);
            return;
        }
        const componentDisplayName = getComponentDisplayName(targetNode);
        guideBgEle.setAttribute('data-component-display-name', componentDisplayName);
        guideBgEle.classList.add(s.guideBgActive);

        const {top, left, width, height} = targetElementSize;
        guideBgEle.style.top = `${top + 1}px`;
        guideBgEle.style.left = `${left + 1}px`;
        guideBgEle.style.width = `${width - 2}px`;
        guideBgEle.style.height = `${height - 2}px`;
    }, [canvasDocument]);

    const showGuideLine = useCallback((targetElement, targetNode, targetElementSize, targetHoverPosition) => {
        if (!canvasDocument) return;
        const guideLineEle = canvasDocument.getElementById('drop-guide-line');
        const guildTipEle = guideLineEle.querySelector('span');

        if (!targetElement || !targetHoverPosition) {
            guideLineEle.classList.remove(s.guideLineActive);
            return;
        }

        const {top, left, width, height} = targetElementSize;
        guideLineEle.classList.add(s.guideLineActive);
        guideLineEle.classList.remove(s.gLeft);
        guideLineEle.classList.remove(s.gRight);

        if (targetHoverPosition === 'left') guideLineEle.classList.add(s.gLeft);
        if (targetHoverPosition === 'right') guideLineEle.classList.add(s.gRight);

        let tipText = '内';
        if (['top', 'left'].includes(targetHoverPosition)) tipText = '前';
        if (['bottom', 'right'].includes(targetHoverPosition)) tipText = '后';
        guildTipEle.innerHTML = tipText;
        const lineSize = 2;
        let guideLineStyle = ({
            left: {left: left - lineSize * 2, top, width: lineSize, height},
            right: {left: left + width + lineSize, top, width: lineSize, height},
            top: {left, top: top - lineSize * 2, width, height: lineSize},
            bottom: {left, top: top + height + lineSize, width, height: lineSize},
            center: {left, top: top + height / 2, width, height: lineSize},
        })[targetHoverPosition];
        Object.entries(guideLineStyle).forEach(([key, value]) => {
            guideLineEle.style[key] = `${value}px`;
        });
    }, [canvasDocument]);

    // 正在拖拽中的节点添加毛玻璃样式
    useEffect(() => {
        if (!draggingElement) return;

        draggingElement.classList.add(s.dragging);
        return () => {
            draggingElement.classList.remove(s.dragging);
        };

    }, [draggingElement]);

    // 选中节点样式
    useEffect(() => {
        const guideBgEle = canvasDocument.getElementById('drop-guide-bg');
        guideBgEle.classList.remove(s.guideBgActive);

        const targetElement = canvasDocument?.querySelector(`.id_${selectedNode?.id}`);
        if (!targetElement) return;

        const targetElementSize = getElementInfo(targetElement, {
            documentElement: canvasDocument.documentElement,
            viewSize: true,
        });

        showGuideBg(targetElement, selectedNode, targetElementSize);

    }, [canvasDocument, selectedNode, showGuideBg]);

    // 投放目标元素样式
    useEffect(() => {
        showGuideBg(targetElement, targetNode, targetElementSize);
        showGuideLine(targetElement, targetNode, targetElementSize, targetHoverPosition);
    }, [showGuideBg, showGuideLine, targetElement, targetNode, targetElementSize, targetHoverPosition]);

    return null;
});
