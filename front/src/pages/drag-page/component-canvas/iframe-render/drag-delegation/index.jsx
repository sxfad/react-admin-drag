import React, { useCallback, useRef } from 'react';
import { useThrottleFn } from 'ahooks';
import {
    setDragImage,
    getIdByElement,
    getDraggableNodeEle,
    getTargetNode,
} from 'src/pages/drag-page/util';
import { findNodeById } from 'src/pages/drag-page-old/node-util';

export default React.memo(function DragDelegation(props) {
    const {
        className,
        children,
        dragPageAction,
        pageConfig,
        componentPaneActiveKey,
        draggingNode,
        canvasDocument,
    } = props;

    const prevComponentPaneActiveKeyRef = useRef(null);
    const mousePositionRef = useRef('');

    const handleDragStart = useCallback((e) => {
        e.stopPropagation();
        const draggingElement = getDraggableNodeEle(e.target);

        if (!draggingElement) return;

        // 设置拖拽缩略图
        setDragImage(e);

        // 打开组树，不是用timeout会导致拖拽失效
        setTimeout(() => {
            prevComponentPaneActiveKeyRef.current = componentPaneActiveKey;
            dragPageAction.setFields({ componentPaneActiveKey: 'componentTree' });
        });

        const componentId = getIdByElement(draggingElement);

        const config = findNodeById(pageConfig, componentId);
        if (!config) return;

        dragPageAction.setFields({
            draggingElement,
            draggingNode: {
                id: config.id,
                config,
            },
        });
    }, [pageConfig, dragPageAction, componentPaneActiveKey]);

    const handleDragEnd = useCallback((e) => {
        e && e.stopPropagation();

        dragPageAction.setFields({
            componentPaneActiveKey: prevComponentPaneActiveKeyRef.current,
            draggingNode: null,
            draggingElement: null,
            targetNode: null,
            targetElement: null,
        });
    }, [dragPageAction]);

    const { run: handleDragOver } = useThrottleFn((e) => {
        e.stopPropagation();
        e.preventDefault();

        let { pageY, pageX } = e;
        const mousePosition = `${pageY},${pageX}`;

        // 如果鼠标位置没有改变，直接返回
        if (mousePositionRef.current === mousePosition) return;
        mousePositionRef.current = mousePosition;

        const element = getDraggableNodeEle(e.target);
        if (!element) return;

        const { documentElement } = canvasDocument;
        const {
            targetNode,
            targetElement,
            targetElementSize,
            targetHoverPosition,
        } = getTargetNode({
            documentElement,
            draggingNode,
            pageConfig,
            targetElement: element,
            pageY,
            pageX,
        }) || { targetNode: null, targetElement: null };

        dragPageAction.setFields({
            targetNode,
            targetElement,
            targetElementSize,
            targetHoverPosition,
        });
    }, { wait: 200 });

    return (
        <div
            className={className}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
        >
            {children}
        </div>
    );
});
