import React, {useCallback} from 'react';
import config from 'src/commons/config-hoc';
import {setDragImage} from 'src/pages/drag-page/util';
import {setNodeId} from 'src/pages/drag-page/util/node-util';

export default React.memo(config({
    connect: true,
})(function DragDelegation(props) {
    const {
        className,
        children,
        action: {dragPage: dragPageAction},
    } = props;

    const handleDragStart = useCallback((e) => {
        // 设置拖拽缩略图
        setDragImage(e);
        // 打开组树，不是用timeout会导致拖拽失效
        setTimeout(() => {
            dragPageAction.setFields({componentPaneActiveKey: 'componentTree'});
        });

        const config = JSON.parse(e.target.dataset.config);

        // 设置唯一id
        setNodeId(config);
        dragPageAction.setFields({
            draggingNode: {
                id: config.id,
                isNewAdd: true,
                config,
            },
        });

    }, [dragPageAction]);

    const handleDragEnd = useCallback((e) => {
        dragPageAction.setFields({
            componentPaneActiveKey: 'componentStore',
            draggingNode: null,
            draggingElement: null,
            targetNode: null,
            targetElement: null,
        });
    }, [dragPageAction]);

    return (
        <div
            className={className}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {children}
        </div>
    );
}));
