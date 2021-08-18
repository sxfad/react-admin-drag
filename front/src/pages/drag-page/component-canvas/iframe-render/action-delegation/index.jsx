import React, {useRef, useEffect} from 'react';
import {useThrottleFn} from 'ahooks';
import {
    setDragImage,
    getIdByElement,
    getDraggableNodeEle,
    getTargetNode,
    usePageConfigChange,
    useNodeChange,
} from 'src/pages/drag-page/util';
import {findNodeById} from 'src/pages/drag-page/util/node-util';

export default React.memo(function DragDelegation(props) {
    const {
        dragPageAction,
        componentPaneActiveKey,
        canvasDocument,
        pageRenderRoot,
        nodeSelectType,
        targetHoverPosition,

        pageConfig,
        draggingNode,
        selectedNode,
        targetNode,
    } = props;

    const pageConfigRefresh = usePageConfigChange();
    const selectedNodeRefresh = useNodeChange(selectedNode);
    const targetNodeRefresh = useNodeChange(targetNode);
    const draggingNodeRefresh = useNodeChange(draggingNode);

    const prevComponentPaneActiveKeyRef = useRef(componentPaneActiveKey);
    const mousePositionRef = useRef('');

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

    // 节流操作
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

    // 空格 + 鼠标拖拽 移动画布
    useEffect(() => {
        if (!canvasDocument) return;

        const info = {
            spaceKeyPress: false,
            mouseDown: false,
            startY: 0,
            startX: 0,
            startScrollTop: 0,
            startScrollLeft: 0,
        };

        let coverELe = canvasDocument.createElement('div');

        function handleSpaceDown(e) {
            const {activeElement} = canvasDocument;
            if (activeElement && ['INPUT', 'TEXTAREA'].includes(activeElement.tagName)) {
                return;
            }

            const {key} = e;
            if (key !== ' ') return;
            e.preventDefault();
            e.stopPropagation();

            if (info.spaceKeyPress) return;

            info.spaceKeyPress = true;

            coverELe.style.position = 'absolute';
            coverELe.style.zIndex = 99999;
            coverELe.style.left = 0;
            coverELe.style.top = 0;
            coverELe.style.right = 0;
            coverELe.style.bottom = 0;
            coverELe.style.background = 'rgba(255, 0, 0, .1)';
            coverELe.style.cursor = 'grab';
            canvasDocument.getElementById('page-canvas').appendChild(coverELe);
        }

        function handleSpaceUp(e) {
            const {key} = e;
            if (key === ' ') {
                info.spaceKeyPress = false;
                info.mouseDown = false;
                coverELe.remove();
            }
        }

        function handleMouseDown(e) {
            if (!info.spaceKeyPress) return;
            info.mouseDown = true;
            coverELe.style.cursor = 'grabbing';
            const {clientY, clientX} = e;
            info.startY = clientY;
            info.startX = clientX;
            info.startScrollTop = canvasDocument.documentElement.scrollTop;
            info.startScrollLeft = canvasDocument.documentElement.scrollLeft;
        }

        function handleMouseMove(e) {
            // console.log(spaceKeyPress);
            if (!info.spaceKeyPress) return;
            if (!info.mouseDown) return;

            coverELe.style.cursor = 'grabbing';

            const {clientY, clientX} = e;
            const y = clientY - info.startY;
            const x = clientX - info.startX;

            const top = info.startScrollTop - y;
            const left = info.startScrollLeft - x;

            canvasDocument.documentElement.scrollTop = top;
            canvasDocument.documentElement.scrollLeft = left;
        }

        function handleMouseUp() {
            if (!info.spaceKeyPress) return;
            info.mouseDown = false;
            coverELe.style.cursor = 'grab';
        }

        canvasDocument.addEventListener('keydown', handleSpaceDown);
        canvasDocument.addEventListener('keyup', handleSpaceUp);
        coverELe && coverELe.addEventListener('mousedown', handleMouseDown);
        coverELe && coverELe.addEventListener('mousemove', handleMouseMove);
        coverELe && coverELe.addEventListener('mouseup', handleMouseUp);
        return () => {
            coverELe && coverELe.remove();
            canvasDocument.removeEventListener('keydown', handleSpaceDown);
            canvasDocument.removeEventListener('keyup', handleSpaceUp);
            coverELe && coverELe.removeEventListener('mousedown', handleMouseDown);
            coverELe && coverELe.removeEventListener('mousemove', handleMouseMove);
            coverELe && coverELe.removeEventListener('mouseup', handleMouseUp);
        };
    }, [canvasDocument]);

    // 拖拽相关事件
    useEffect(() => {
        if (!pageRenderRoot) return;

        const handleDropEffect = (e) => {
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
        };

        const onOver = e => {
            // 阻止默认事件，否则drop 不触发
            e.preventDefault();
            e.stopPropagation();
            handleDropEffect(e);
            handleChangeDropType(e);
            handleDragOver(e);
        };
        const handleDragStart = (e) => {
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
        };

        const handleDragEnd = (e) => {
            e && e.stopPropagation();
            e && e.preventDefault();

            dragPageAction.setFields({
                componentPaneActiveKey: prevComponentPaneActiveKeyRef.current,
                draggingNode: null,
                draggingElement: null,
                targetNode: null,
            });
        };

        const handleDrop = (e) => {
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
        };

        pageRenderRoot.addEventListener('dragstart', handleDragStart);
        pageRenderRoot.addEventListener('dragend', handleDragEnd);
        pageRenderRoot.addEventListener('dragover', onOver);
        pageRenderRoot.addEventListener('drop', handleDrop);

        return () => {
            pageRenderRoot.removeEventListener('dragstart', handleDragStart);
            pageRenderRoot.removeEventListener('dragend', handleDragEnd);
            pageRenderRoot.removeEventListener('dragover', onOver);
            pageRenderRoot.removeEventListener('drop', handleDrop);
        };

    }, [
        pageRenderRoot,
        handleChangeDropType,
        handleDragOver,
        componentPaneActiveKey,
        targetHoverPosition,

        dragPageAction,
        pageConfig,
        pageConfigRefresh,
        draggingNode,
        draggingNodeRefresh,
        targetNode,
        targetNodeRefresh,
    ]);

    // 点击 选中节点
    useEffect(() => {
        if (!pageRenderRoot) return;

        const handleClick = (e) => {
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
        };

        // 捕获阶段触发，通过 e.stopPropagation() 阻止传递，防止组件自身的点击事件触发
        pageRenderRoot.addEventListener('click', handleClick, true);

        return () => {
            pageRenderRoot.removeEventListener('click', handleClick, true);
        };

    }, [
        dragPageAction,
        pageRenderRoot,
        nodeSelectType,
        selectedNode,
        selectedNodeRefresh,
        pageConfig,
        pageConfigRefresh,
    ]);

    return null;
});
