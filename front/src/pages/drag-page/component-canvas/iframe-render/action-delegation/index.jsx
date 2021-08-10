import React, {useCallback, useRef, useEffect} from 'react';
import {useThrottleFn} from 'ahooks';
import {
    setDragImage,
    getIdByElement,
    getDraggableNodeEle,
    getTargetNode,
} from 'src/pages/drag-page/util';
import {findNodeById} from 'src/pages/drag-page-old/node-util';

export default React.memo(function DragDelegation(props) {
    const {
        className,
        children,
        dragPageAction,
        pageConfig,
        componentPaneActiveKey,
        draggingNode,
        canvasDocument,
        nodeSelectType,
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
            dragPageAction.setFields({componentPaneActiveKey: 'componentTree'});
        });

        const componentId = getIdByElement(draggingElement);

        const config = findNodeById(pageConfig, componentId);
        if (!config) return;

        dragPageAction.setFields({
            draggingElement,
            draggingNode: {
                id: config.id,
                type: 'move',
                config,
            },
        });
    }, [pageConfig, dragPageAction, componentPaneActiveKey]);

    const handleDragEnd = useCallback((e) => {
        e && e.stopPropagation();
        e && e.preventDefault();

        dragPageAction.setFields({
            componentPaneActiveKey: prevComponentPaneActiveKeyRef.current,
            draggingNode: null,
            draggingElement: null,
            targetNode: null,
            targetElement: null,
        });
    }, [dragPageAction]);

    const {run: handleDragOver} = useThrottleFn((e) => {
        e.stopPropagation();
        e.preventDefault();

        // 监听键盘案件 修改 draggingNode.type
        const {metaKey, ctrlKey, altKey, shiftKey} = e;
        const metaOrCtrl = metaKey || ctrlKey;

        let dropType;
        if (metaOrCtrl) dropType = 'wrapper';
        if (altKey) dropType = 'props';
        if (shiftKey) dropType = 'replace';

        if (draggingNode.dropType !== dropType) {
            dragPageAction.setFields({draggingNode: {...draggingNode, dropType}});

            // 改变鼠标样式 TODO 不好使。。。
            const cursors = {
                'new': 'copy',
                'move': 'move',
                'props': 'link',
                'wrapper': 'link',
                'replace': 'link',
            };

            const cursor = cursors[dropType] || cursors[draggingNode?.type] || 'auto';
            console.log(cursor);
            e.dataTransfer.dropEffect = cursor;
        }

        let {pageY, pageX} = e;
        const mousePosition = `${pageY},${pageX}`;

        // 如果鼠标位置没有改变，直接返回
        if (mousePositionRef.current === mousePosition) return;
        mousePositionRef.current = mousePosition;

        const element = getDraggableNodeEle(e.target);
        if (!element) return;

        const {documentElement} = canvasDocument;
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
        }) || {targetNode: null, targetElement: null};

        dragPageAction.setFields({
            targetNode,
            targetElement,
            targetElementSize,
            targetHoverPosition,
        });
    }, {wait: 200});


    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        // 执行insertNode之后，会导致 handleDragEnd 不触发
        dragPageAction.insertNode();

        // 手动调用一次dragEnd方法
        handleDragEnd();

    }, [dragPageAction, handleDragEnd]);

    const handleClick = useCallback((e) => {
        const element = getDraggableNodeEle(e.target);
        if (!element) return;
        const componentId = getIdByElement(element);
        const selectedNode = findNodeById(pageConfig, componentId);
        if (!selectedNode) return;

        if (nodeSelectType === 'meta' && (e.metaKey || e.ctrlKey)) {
            e.stopPropagation && e.stopPropagation();
            e.preventDefault && e.preventDefault();
            dragPageAction.setFields({selectedNode});
        }

        if (nodeSelectType === 'click') {
            dragPageAction.setFields({selectedNode});
        }

    }, [dragPageAction, nodeSelectType, pageConfig]);

    // 键盘事件
    useEffect(() => {
        const handleKeyDown = (e) => {

            const {metaKey, ctrlKey, key} = e;
            const metaOrCtrl = metaKey || ctrlKey;

            // commend(ctrl) + d 删除选中节点
            if (metaOrCtrl && key === 'd') {
                e.stopPropagation();
                e.preventDefault();
                dragPageAction.deleteSelectedNode();
            }
        };

        canvasDocument.body.addEventListener('keydown', handleKeyDown);
        return () => {
            canvasDocument.body.removeEventListener('keydown', handleKeyDown);
        };
    }, [canvasDocument.body, dragPageAction]);

    return (
        <div
            className={className}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={e => {
                // 阻止默认事件，否则drop 不触发
                e.preventDefault();
                e.stopPropagation();
                handleDragOver(e);
            }}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            {children}
        </div>
    );
});
