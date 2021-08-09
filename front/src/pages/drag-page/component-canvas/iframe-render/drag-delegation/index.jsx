import React, {useCallback} from 'react';
import {usePrevious} from 'ahooks';
import {setDragImage, getIdByElement, getNodeEle} from 'src/pages/drag-page/util';
import {findNodeById} from 'src/pages/drag-page-old/node-util';

export default React.memo(function DragDelegation(props) {
    const {
        className,
        children,
        dragPageAction,
        pageConfig,
        componentPaneActiveKey,
    } = props;

    const prevComponentPaneActiveKey = usePrevious(componentPaneActiveKey);

    const handleDragStart = useCallback((e) => {
        e.stopPropagation();
        const draggingElement = getNodeEle(e.target);

        if (!draggingElement) return;

        // 设置拖拽缩略图
        setDragImage(e);
        // 打开组树，不是用timeout会导致拖拽失效
        setTimeout(() => {
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

    }, [pageConfig, dragPageAction]);

    const handleDragEnd = useCallback((e) => {
        e && e.stopPropagation();

        dragPageAction.setFields({
            componentPaneActiveKey: prevComponentPaneActiveKey,
            draggingNode: null,
            draggingElement: null,
        });
    }, [dragPageAction, prevComponentPaneActiveKey]);

    const handleDragEnter = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();

        const targetElement = getNodeEle(e.target);

        if (!targetElement) return;

        const componentId = getIdByElement(targetElement);

        const config = findNodeById(pageConfig, componentId);
        if (!config) return;

        dragPageAction.setFields({
            targetNode: config,
            targetElement,
        });

    }, [pageConfig, dragPageAction]);

    const handleDragLeave = useCallback((e) => {
        // dragPageAction.setFields({
        //     targetNode: null,
        //     targetElement: null,
        // });
    }, [dragPageAction]);

    return (
        <div
            className={className}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
        >
            {children}
        </div>
    );
});
