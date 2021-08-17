import React, {useEffect, useCallback, useState} from 'react';
import {getComponentDisplayName} from 'src/pages/drag-page/component-config';
import {getElementInfo, useNodeChange, usePageConfigChange} from 'src/pages/drag-page/util';
import s from './style.less';

// 改变背景颜色，不同投放类型，对应不同的样色
const DEFAULT_OPACITY = 0.1;
export const GUIDE_COLORS = {
    'props': (opacity = DEFAULT_OPACITY) => `rgba(255, 0, 0, ${opacity})`, // 红
    'replace': (opacity = DEFAULT_OPACITY) => `rgba(128, 128, 0, ${opacity})`, // 黄
    'wrapper': (opacity = DEFAULT_OPACITY) => `rgba(0, 0, 255, ${opacity})`, // 蓝色
    'default': (opacity = DEFAULT_OPACITY) => `rgba(0, 180, 0, ${opacity})`, // 绿色
};

export default React.memo(function DragGuide(props) {
    const {
        canvasDocument,
        draggingElement,
        targetHoverPosition,
        componentPaneWidth,
        propsPaneWidth,
        componentPaneExpended,
        propsPaneExpended,
        canvasScale,
        pageState,

        pageConfig,
        targetNode,
        selectedNode,
        draggingNode,
    } = props;

    const [refresh, setRefresh] = useState({});
    const pageConfigRefresh = usePageConfigChange();
    const selectedNodeRefresh = useNodeChange(selectedNode);
    const targetNodeRefresh = useNodeChange(targetNode);
    const draggingNodeRefresh = useNodeChange(draggingNode);

    const showGuideBg = useCallback((targetNode) => {
        if (!canvasDocument) return;

        const guideBgEle = canvasDocument.getElementById('drop-guide-bg');
        const guideNameEle = canvasDocument.getElementById('drop-guide-name');

        const targetElement = canvasDocument.querySelector(`.id_${targetNode?.id}`);
        if (!targetElement) {
            guideBgEle.classList.remove(s.guideBgActive);
            return;
        }

        const targetElementSize = getElementInfo(targetElement, {
            documentElement: canvasDocument.documentElement,
            viewSize: true,
            scale: canvasScale,
        });

        if (!targetElementSize || targetElementSize.height <= 0 || targetElementSize.width <= 0) {
            guideBgEle.classList.remove(s.guideBgActive);
            return;
        }

        const componentDisplayName = getComponentDisplayName(targetNode);
        const displayName = typeof componentDisplayName === 'object' ? targetNode?.componentName : componentDisplayName;
        guideNameEle.setAttribute('data-component-display-name', displayName);
        guideBgEle.classList.add(s.guideBgActive);

        const {top, left, width, height} = targetElementSize;

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

    }, [canvasDocument, draggingNode, canvasScale]);

    const showGuideLine = useCallback((targetNode, targetHoverPosition) => {
        if (!canvasDocument) return;

        const targetElement = canvasDocument.querySelector(`.id_${targetNode?.id}`);

        const guideLineEle = canvasDocument.getElementById('drop-guide-line');
        const guildTipEle = guideLineEle.querySelector('span');

        if (
            // 目标元素不存在
            !targetElement
            // 投放位置不存在
            || !targetHoverPosition
            // 属性、包裹、替换时，也不现实line
            || (draggingNode && ['props', 'wrapper', 'replace'].includes(draggingNode.dropType))
        ) {
            guideLineEle.classList.remove(s.guideLineActive);
            return;
        }

        const targetElementSize = getElementInfo(targetElement, {
            documentElement: canvasDocument.documentElement,
            viewSize: true,
            scale: canvasScale,
        });


        const {top, left, width, height} = targetElementSize;
        guideLineEle.classList.add(s.guideLineActive);
        guideLineEle.classList.remove(s.gLeft);
        guideLineEle.classList.remove(s.gRight);

        if (targetHoverPosition === 'left') guideLineEle.classList.add(s.gLeft);
        if (targetHoverPosition === 'right') guideLineEle.classList.add(s.gRight);

        // 设置提示文字
        let tipText = '内';
        if (['top', 'left'].includes(targetHoverPosition)) tipText = '前';
        if (['bottom', 'right'].includes(targetHoverPosition)) tipText = '后';
        guildTipEle.innerHTML = tipText;

        // 设置提示线条样式
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
    }, [canvasDocument, draggingNode, canvasScale]);

    // 正在拖拽中的节点添加毛玻璃样式
    useEffect(() => {
        if (!draggingElement) return;

        draggingElement.classList.add(s.dragging);
        return () => draggingElement.classList.remove(s.dragging);
    }, [draggingElement]);

    // 投放目标元素样式
    useEffect(() => {
        // 防抖效果
        const t = setTimeout(() => {
            // 拖拽过程中，通过 targetNode 显示背景，其他情况通过 selectedNode 显示背景
            showGuideBg(targetNode || selectedNode);
            showGuideLine(targetNode, targetHoverPosition);
        });
        return () => clearTimeout(t);
    }, [
        showGuideBg,
        showGuideLine,
        targetHoverPosition,
        refresh,
        componentPaneWidth,
        propsPaneWidth,
        componentPaneExpended,
        propsPaneExpended,
        canvasScale,

        pageConfig,
        pageConfigRefresh,
        targetNode,
        targetNodeRefresh,
        selectedNode,
        selectedNodeRefresh,
        draggingNode,
        draggingNodeRefresh,
    ]);

    // 滚动时，刷新
    useEffect(() => {
        if (!canvasDocument) return;
        const handleScroll = () => setRefresh({});
        canvasDocument.addEventListener('scroll', handleScroll);
        return () => {
            canvasDocument.removeEventListener('scroll', handleScroll);
        };
    }, [canvasDocument]);

    // scale 改变时，有动画，等待动画结束之后再调用
    // pageConfig, pageState 等待渲染之后再调用
    useEffect(() => {
        const t = setTimeout(() => setRefresh({}), 400);
        return () => clearTimeout(t);
    }, [canvasScale, pageConfig, pageConfigRefresh, pageState]);

    // 弹框有可能会出现滚动条，滚动时，刷新
    useEffect(() => {
        if (!canvasDocument) return;
        const handleScroll = () => setRefresh({});

        // 等待弹框渲染
        const t = setTimeout(() => {
            canvasDocument.querySelectorAll('.ant-modal-wrap')
                .forEach(ele => ele.addEventListener('scroll', handleScroll));
        });

        return () => {
            clearTimeout(t);

            canvasDocument.querySelectorAll('.ant-modal-wrap')
                .forEach(ele => ele.removeEventListener('scroll', handleScroll));
        };
    }, [canvasDocument, pageState]);

    return null;
});
