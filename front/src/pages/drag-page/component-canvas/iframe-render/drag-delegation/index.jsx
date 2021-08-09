import React, {useCallback} from 'react';
import config from 'src/commons/config-hoc';
import {setDragImage} from 'src/pages/drag-page/util';
import {setNodeId} from 'src/pages/drag-page/util/node-util';

export default React.memo(function DragDelegation(props) {
    const {
        className,
        children,
        dragPageAction,
    } = props;

    const handleDragStart = useCallback((e) => {
        e.stopPropagation();
        const dragEle = e.target;

        // 设置拖拽缩略图
        setDragImage(e);
        // 打开组树，不是用timeout会导致拖拽失效
        setTimeout(() => {
            dragPageAction.setFields({componentPaneActiveKey: 'componentTree'});
        });
        const result = /id_(.*)/.exec(dragEle.className);
        if (!result) return;
        let componentId = result[1];
        if (!componentId) return;
        componentId = componentId.split(' ')[0];


        console.log(componentId);
        //
        //
        // const config = JSON.parse(e.target.dataset.config);
        //
        // // 设置唯一id
        // setNodeId(config);
        // dragPageAction.setFields({
        //     draggingNode: {
        //         id: config.id,
        //         isNewAdd: true,
        //         config,
        //     },
        // });

    }, [dragPageAction]);

    const handleDragEnd = useCallback((e) => {
        dragPageAction.setFields({
            componentPaneActiveKey: 'componentStore',
            draggingNode: null,
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
});
