import React, {useCallback, useRef, useEffect} from 'react';
import {useThrottleFn} from 'ahooks';
import {
    setDragImage,
    getIdByElement,
    getDraggableNodeEle,
    getTargetNode,
    copyTextToClipboard, getImageUrlByClipboard,
} from 'src/pages/drag-page/util';
import {findNodeById, isNode, setNodeId} from 'src/pages/drag-page/util/node-util';

export default React.memo(function DragDelegation(props) {
    const {
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
        });
        dragPageAction.setDraggingNode({
            id: config.id,
            type: 'move',
            config,
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
        });
    }, [dragPageAction]);

    // 监听键盘事件 修改 draggingNode.type
    const {run: handleChangeDropType} = useThrottleFn((e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!draggingNode) return;
        const {metaKey, ctrlKey, altKey, shiftKey} = e;
        const metaOrCtrl = metaKey || ctrlKey;

        let {dropType, dropTypeChangeable} = draggingNode;

        // 只能作为wrapper等情况，不允许改变dropType，直接return
        if (!dropTypeChangeable) return;

        if (metaOrCtrl) dropType === 'wrapper' ? dropType = null : dropType = 'wrapper';
        if (altKey) dropType === 'props' ? dropType = null : dropType = 'props';
        if (shiftKey) dropType === 'replace' ? dropType = null : dropType = 'replace';

        if (draggingNode.dropType === dropType) return;

        dragPageAction.setFields({draggingNode: {...draggingNode, dropType}});

        // 改变鼠标样式
        const cursors = {
            'new': 'copy',
            'move': 'move',
            'props': 'link',
            'wrapper': 'link',
            'replace': 'link',
        };

        e.dataTransfer.dropEffect = cursors[dropType] || cursors[draggingNode?.type] || 'auto';
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
        const {pageY, pageX} = e;
        const mousePosition = `${pageY},${pageX}`;

        // 如果鼠标位置没有改变，直接返回
        if (mousePositionRef.current === mousePosition) return;
        mousePositionRef.current = mousePosition;

        const element = getDraggableNodeEle(e.target);
        if (!element) return;

        const {documentElement} = canvasDocument;
        const {
            targetNode,
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
        let nextSelectedNode = findNodeById(pageConfig, componentId);
        if (!nextSelectedNode) return;

        if (nodeSelectType === 'meta' && (e.metaKey || e.ctrlKey)) {
            e.stopPropagation && e.stopPropagation();
            e.preventDefault && e.preventDefault();
            // 再次点击选中节点，取消选中
            if (nextSelectedNode.id === selectedNode?.id) nextSelectedNode = null;
            dragPageAction.setFields({selectedNode: nextSelectedNode});
        }

        if (nodeSelectType === 'click') {
            if (nextSelectedNode.id === selectedNode?.id) nextSelectedNode = null;
            dragPageAction.setFields({selectedNode: nextSelectedNode});
        }

    }, [dragPageAction, selectedNode, nodeSelectType, pageConfig]);

    // 操作SelectedNode相关的快捷键
    const handleSelectedNodeKeyDown = useCallback((e) => {
        const {metaKey, ctrlKey, key} = e;
        const metaOrCtrl = metaKey || ctrlKey;

        // Escape 取消选中节点
        if (key === 'Escape' && selectedNode) {
            dragPageAction.setFields({
                selectedNode: null,
            });
        }

        // Backspace Delete 键也删除 要区分是否有输入框获取焦点
        if (['Delete', 'Backspace'].includes(key)) {

            const {activeElement} = canvasDocument;
            if (activeElement && ['INPUT', 'TEXTAREA'].includes(activeElement.tagName)) {
                return;
            }
            dragPageAction.deleteNodeById(selectedNode?.id);
        }

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

    }, [dragPageAction, selectedNode, canvasDocument]);

    // 获取剪切板中的图片
    const getNodeByImage = useCallback(async e => {
        try {
            const src = await getImageUrlByClipboard(e);
            return {
                componentName: 'img',
                props: {
                    src,
                    width: '100%',
                },
            };
        } catch (e) {
            console.error(e);
            return null;
        }

    }, []);

    const getNodeByText = useCallback(e => {
        try {
            const clipboardData = e.clipboardData || window.clipboardData;
            const text = clipboardData.getData('text/plain');
            // 不是对象字符串
            if (!text || !text.startsWith('{')) return;
            const cloneNode = JSON.parse(text);

            // 不是节点
            if (!isNode(cloneNode)) return;

            return cloneNode;
        } catch (e) {
            console.error(e);
        }
    }, []);

    const handlePaste = useCallback(async (e) => {
        if (!selectedNode) return;

        const node = await getNodeByText(e) || await getNodeByImage(e);

        if (!node) return;

        setNodeId(node, true);

        // 插入
        dragPageAction.insertNode({
            draggingNode: {
                id: node.id,
                type: 'copy',
                config: node,
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
    }, [dragPageAction, selectedNode, getNodeByText, getNodeByImage]);

    // 键盘事件
    useEffect(() => {
        if(!canvasDocument) return;

        canvasDocument.addEventListener('keydown', handleSelectedNodeKeyDown);
        canvasDocument.addEventListener('paste', handlePaste);
        return () => {
            canvasDocument.removeEventListener('keydown', handleSelectedNodeKeyDown);
            canvasDocument.removeEventListener('paste', handlePaste);
        };
    }, [canvasDocument, handleSelectedNodeKeyDown, handlePaste]);

    // 快捷键使组价搜索输入框获取焦点，并选中输入框中所有内容
    const handleSearchKeyDown = useCallback((e) => {
        const {metaKey, ctrlKey, key} = e;
        const metaOrCtrl = metaKey || ctrlKey;

        if (metaOrCtrl && key === 'f') {
            e.stopPropagation();
            e.preventDefault();

            const inputEle = window.document.getElementById('search-component');
            if (!inputEle) return;

            dragPageAction.setFields({
                componentPaneActiveKey: 'componentStore',
            });

            inputEle.focus();
            inputEle.select();
        }
    }, [dragPageAction]);

    // 在组件库中查找组件
    useEffect(() => {
        if(!canvasDocument) return;

        window.addEventListener('keydown', handleSearchKeyDown);
        canvasDocument.addEventListener('keydown', handleSearchKeyDown);
        return () => {
            canvasDocument.removeEventListener('keydown', handleSearchKeyDown);
            window.removeEventListener('keydown', handleSearchKeyDown);
        };
    }, [canvasDocument, handleSearchKeyDown]);

    // 拖拽相关事件
    useEffect(() => {
        if(!canvasDocument) return;

        const onOver = e => {
            // 阻止默认事件，否则drop 不触发
            e.preventDefault();
            e.stopPropagation();
            handleDropEffect(e);
            handleChangeDropType(e);
            handleDragOver(e);
        }
        canvasDocument.addEventListener('dragstart', handleDragStart);
        canvasDocument.addEventListener('dragend', handleDragEnd);
        canvasDocument.addEventListener('dragover', onOver);
        canvasDocument.addEventListener('drop', handleDrop);
        canvasDocument.addEventListener('click', handleClick);

        return () => {
          canvasDocument.removeEventListener('dragstart', handleDragStart);
          canvasDocument.removeEventListener('dragend', handleDragEnd);
          canvasDocument.removeEventListener('dragover', onOver);
          canvasDocument.removeEventListener('drop', handleDrop);
          canvasDocument.removeEventListener('click', handleClick);
        }

    }, [
      canvasDocument,
      handleDropEffect,
      handleChangeDropType,
      handleDragOver,
      handleDragStart,
      handleDragEnd,
      handleDrop,
      handleClick,
    ]);

    return null;
});
