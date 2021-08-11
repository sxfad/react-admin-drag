import React, {useCallback, useRef, useEffect} from 'react';
import {useThrottleFn} from 'ahooks';
import {
    setDragImage,
    getIdByElement,
    getDraggableNodeEle,
    getTargetNode,
    copyTextToClipboard,
} from 'src/pages/drag-page/util';
import {findNodeById, isNode, setNodeId} from 'src/pages/drag-page/util/node-util';

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
        selectedNode,
        targetNode,
        targetHoverPosition,
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

    // 监听键盘事件 修改 draggingNode.type
    const {run: handleChangeDropType} = useThrottleFn((e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!draggingNode) return;
        const {metaKey, ctrlKey, altKey, shiftKey} = e;
        const metaOrCtrl = metaKey || ctrlKey;

        let dropType = draggingNode.dropType;
        if (metaOrCtrl) dropType === 'wrapper' ? dropType = null : dropType = 'wrapper';
        if (altKey) dropType === 'props' ? dropType = null : dropType = 'props';
        if (shiftKey) dropType === 'replace' ? dropType = null : dropType = 'replace';

        if (draggingNode.dropType === dropType) return;

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

        e.dataTransfer.dropEffect = cursor;


    }, {wait: 100});

    const handleDropEffect = useCallback((e) => {
        if (!draggingNode) return;

        const {dropType, type} = draggingNode;
        // 改变鼠标样式
        const cursors = {
            'new': 'copy',
            'move': 'move',
            'props': 'link',
            'wrapper': 'link',
            'replace': 'link',
        };

        e.dataTransfer.dropEffect = cursors[dropType] || cursors[type] || 'auto';
        setDragImage(e, dropType || type);
    }, [draggingNode]);

    const {run: handleDragOver} = useThrottleFn((e) => {
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
        dragPageAction.insertNode({
            draggingNode,
            targetNode,
            targetHoverPosition,
        });

        // 手动调用一次dragEnd方法
        handleDragEnd();

    }, [dragPageAction, draggingNode, targetNode, targetHoverPosition, handleDragEnd]);

    // 鼠标点击事件 选中节点
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

            // TODO backspace delete 键也删除

            // command(ctrl) + d 删除选中节点
            if (metaOrCtrl && key === 'd') {
                e.stopPropagation();
                e.preventDefault();
                dragPageAction.deleteNodeById(selectedNode?.id);
            }

            // command(ctrl) + c 复制当前选中节点
            if (metaOrCtrl && key === 'c') {
                if (!selectedNode) return;

                const selection = window.getSelection();
                const selectionText = selection + '';

                // 用户有选中内容
                if (selectionText) return;

                // 将当前选中节点，保存到剪切板中
                copyTextToClipboard(JSON.stringify(selectedNode));
            }

        };

        const handlePaste = (e) => {
            if (!selectedNode) return;
            try {
                const clipboardData = e.clipboardData || window.clipboardData;
                const text = clipboardData.getData('text/plain');
                // 不是对象字符串
                if (!text || !text.startsWith('{')) return;
                const cloneNode = JSON.parse(text);
                // 不是节点
                if (!isNode(cloneNode)) return;
                setNodeId(cloneNode, true);

                dragPageAction.insertNode({
                    draggingNode: {
                        id: cloneNode.id,
                        type: 'copy',
                        config: cloneNode,
                    },
                    targetNode: selectedNode,
                    targetHoverPosition: 'right',
                });

                // 等待插入结束之后，清空相关数据
                setTimeout(() => {
                    dragPageAction.setFields({
                        draggingNode: null,
                        targetHoverPosition: null,
                    });
                });
            } catch (e) {
                console.error(e);
            }
        };

        canvasDocument.body.addEventListener('keydown', handleKeyDown);
        canvasDocument.body.addEventListener('paste', handlePaste);
        return () => {
            canvasDocument.body.removeEventListener('keydown', handleKeyDown);
            canvasDocument.body.removeEventListener('paste', handlePaste);
        };
    }, [canvasDocument.body, dragPageAction, selectedNode]);

    return (
        <div
            className={className}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={e => {
                // 阻止默认事件，否则drop 不触发
                e.preventDefault();
                e.stopPropagation();
                handleDropEffect(e);
                handleChangeDropType(e);
                handleDragOver(e);
            }}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            {children}
        </div>
    );
});
