import React, {useCallback, useRef} from 'react';
import {setDragImage, getIdByElement, getNodeEle, getTargetNode} from 'src/pages/drag-page/util';
import {findNodeById} from 'src/pages/drag-page-old/node-util';

export default React.memo(function DragDelegation(props) {
    const {
        className,
        children,
        dragPageAction,
        pageConfig,
        componentPaneActiveKey,
        draggingNode,
    } = props;

    const prevComponentPaneActiveKeyRef = useRef(null);

    const handleDragStart = useCallback((e) => {
        e.stopPropagation();
        const draggingElement = getNodeEle(e.target);

        if (!draggingElement) return;

        // 设置拖拽缩略图
        setDragImage(e);

        // 打开组树，不是用timeout会导致拖拽失效
        setTimeout(() => {
            prevComponentPaneActiveKeyRef.current = componentPaneActiveKey;
            dragPageAction.setFields({componentPaneActiveKey: 'componentTree'});
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


    const handleDragEnter = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();

        const targetElement = getNodeEle(e.target);

        if (!targetElement) return;

        const componentId = getIdByElement(targetElement);

        const targetNode = getTargetNode({draggingNode, pageConfig, componentId});

        dragPageAction.setFields({
            targetNode,
            targetElement: targetNode ? targetElement : null,
        });

    }, [pageConfig, draggingNode, dragPageAction]);

    return (
        <div
            className={className}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragEnter={handleDragEnter}
        >
            {children}
        </div>
    );
});
