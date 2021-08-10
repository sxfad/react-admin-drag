import React, { useEffect, useCallback } from 'react';
import { getComponentDisplayName } from 'src/pages/drag-page-old/component-config';
import s from './style.less';
import { getElementInfo } from 'src/pages/drag-page/util';

// 改变背景颜色，不同投放类型，对应不同的样色
const DEFAULT_OPACITY = 0.3;
const GUIDE_COLORS = {
    'props': (opacity = DEFAULT_OPACITY) => `rgba(255, 0, 0, ${opacity})`, // 红
    'replace': (opacity = DEFAULT_OPACITY) => `rgba(128, 128, 0, ${opacity})`, // 黄
    'wrapper': (opacity = DEFAULT_OPACITY) => `rgba(0, 0, 255, ${opacity})`, // 蓝色
    'default': (opacity = DEFAULT_OPACITY) => `rgba(0, 180, 0, ${opacity})`, // 绿色
};

export default React.memo(function DragGuide(props) {
    const {
        canvasDocument,
        draggingElement,
        targetElement,
        targetElementSize,
        targetHoverPosition,
        targetNode,
        selectedNode,
        draggingNode,
    } = props;

    const showGuideBg = useCallback((targetElement, targetNode, targetElementSize) => {
        if (!canvasDocument) return;
        const guideBgEle = canvasDocument.getElementById('drop-guide-bg');
        const guideNameEle = canvasDocument.getElementById('drop-guide-name');
        if (!targetElement) {
            guideBgEle.classList.remove(s.guideBgActive);
            return;
        }
        const componentDisplayName = getComponentDisplayName(targetNode);
        guideNameEle.setAttribute('data-component-display-name', componentDisplayName);
        guideBgEle.classList.add(s.guideBgActive);

        const { top, left, width, height } = targetElementSize;
        guideBgEle.style.top = `${top + 1}px`;
        guideBgEle.style.left = `${left + 1}px`;
        guideBgEle.style.width = `${width - 2}px`;
        guideBgEle.style.height = `${height - 2}px`;

        // 改变背景颜色，不同投放类型，对应不同的样色
        const color = GUIDE_COLORS[draggingNode?.dropType] || GUIDE_COLORS.default;

        guideBgEle.style.backgroundColor = color();
        guideBgEle.style.outlineColor = color(1);
        guideBgEle.style.color = color(1);
        guideNameEle.style.backgroundColor = color(1);

    }, [canvasDocument, draggingNode]);

    const showGuideLine = useCallback((targetElement, targetNode, targetElementSize, targetHoverPosition) => {
        if (!canvasDocument) return;
        const guideLineEle = canvasDocument.getElementById('drop-guide-line');
        const guildTipEle = guideLineEle.querySelector('span');

        if (
            // 目标元素不存在
            !targetElement
            // 投放位置不存在
            || !targetHoverPosition
            // 属性、包裹、替换时，也不现实line
            || ['props', 'wrapper', 'replace'].includes(draggingNode.dropType)
        ) {
            guideLineEle.classList.remove(s.guideLineActive);
            return;
        }

        const { top, left, width, height } = targetElementSize;
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
            left: { left: left - lineSize * 2, top, width: lineSize, height },
            right: { left: left + width + lineSize, top, width: lineSize, height },
            top: { left, top: top - lineSize * 2, width, height: lineSize },
            bottom: { left, top: top + height + lineSize, width, height: lineSize },
            center: { left, top: top + height / 2, width, height: lineSize },
        })[targetHoverPosition];
        Object.entries(guideLineStyle).forEach(([key, value]) => {
            guideLineEle.style[key] = `${value}px`;
        });
    }, [canvasDocument, draggingNode]);

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
    }, [canvasDocument, selectedNode, draggingNode, showGuideBg]);

    // 投放目标元素样式
    useEffect(() => {
        showGuideBg(targetElement, targetNode, targetElementSize);
        showGuideLine(targetElement, targetNode, targetElementSize, targetHoverPosition);
    }, [showGuideBg, showGuideLine, targetElement, targetNode, targetElementSize, targetHoverPosition]);

    return null;
});
