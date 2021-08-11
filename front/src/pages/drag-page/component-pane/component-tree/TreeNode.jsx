import React, { useState, useRef, useCallback } from 'react';
import { useThrottleFn } from 'ahooks';
import config from 'src/commons/config-hoc';
import { getTargetNode } from 'src/pages/drag-page/util';
import s from './style.less';

export default config({
    connect: state => {
        return {
            pageConfig: state.dragPage.pageConfig,
            draggingNode: state.dragPage.draggingNode,
            canvasDocument: state.dragPage.canvasDocument,
        };
    },
})(function TreeNode(props) {
    const {
        node,
        selectedKey,
        pageConfig,
        draggingNode,
        expandedKeys,
        onExpand,
        canvasDocument,

        action: { dragPage: dragPageAction },
    } = props;

    let { key, name, icon, isContainer, draggable, nodeData } = node;

    name = <span className={s.nodeTitle}>{icon}{name}</span>;

    const hoverRef = useRef(0);
    const nodeRef = useRef(null);
    const [dragIn, setDragIn] = useState(false);
    const [accept, setAccept] = useState(true);
    const [dropPosition, /*setDropPosition*/] = useState('');

    const handleDragStart = useCallback((e) => {
        e.stopPropagation();

        if (!draggable) {
            e.preventDefault();
            return;
        }

        dragPageAction.setDraggingNode({
            id: nodeData.id,
            config: nodeData,
            type: 'move',
        });
    }, [dragPageAction, draggable, nodeData]);

    const handleDragEnter = useCallback(() => {
        if (!draggable) return;

        // 进入自身
        if (draggingNode?.id === key) return;

        setDragIn(true);
        setAccept(true);
    }, [draggable, draggingNode, key]);


    const THROTTLE_TIME = 100;
    const { run: throttleOver } = useThrottleFn(e => {
        const element = e.target;

        if (!element) return;

        const { pageY, pageX } = e;
        const { documentElement } = canvasDocument;
        const {
            targetNode,
            // targetElement,
            // targetElementSize,
            targetHoverPosition,
        } = getTargetNode({
            documentElement,
            draggingNode,
            pageConfig,
            targetElement: element,
            pageY,
            pageX,
            horizontal: false,
            simple: true,
        }) || { targetNode: null, targetElement: null };


        // 自身上，直接返回
        if (draggingNode?.id === key) return;

        // 1s 后展开节点
        if (!hoverRef.current) {
            hoverRef.current = setTimeout(() => {
                if (!expandedKeys.some(k => k === key)) {
                    onExpand([...expandedKeys, key]);
                }
            }, 300);
        }

        console.log(targetHoverPosition);
        dragPageAction.setFields({
            targetNode,
            // targetElement,
            // targetElementSize,
            targetHoverPosition,
        });
    }, { wait: THROTTLE_TIME, trailing: false });

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!draggingNode || !draggable) return;
        const { dropType, type } = draggingNode;

        let cursor = 'move';

        if (type === 'new') cursor = 'copy';

        if (['props', 'replace', 'wrapper'].includes(dropType)) cursor = 'link';

        e.dataTransfer.dropEffect = cursor;

        throttleOver(e);
    }, [draggingNode, throttleOver, draggable]);

    const handleDragLeave = useCallback((e) => {
        setDragIn(false);
        setAccept(true);

        if (!draggable) return;

        if (hoverRef.current) {
            clearTimeout(hoverRef.current);
            hoverRef.current = 0;
        }
    }, [draggable]);


    const handleDragEnd = useCallback(() => {
        setAccept(true);
        if (!draggable) return;

        if (hoverRef.current) {
            clearTimeout(hoverRef.current);
            hoverRef.current = 0;
        }

        dragPageAction.setDraggingNode(null);
    }, [dragPageAction, draggable]);

    const handleDrop = useCallback((e) => {
        const end = () => {
            handleDragLeave(e);
            handleDragEnd();
        };

        if (!draggable) return end();

        e.preventDefault();
        e.stopPropagation();

        // TODO 投放

    }, [draggable, handleDragEnd, handleDragLeave]);

    const isSelected = selectedKey === key;
    const isDragging = draggingNode?.id === key;

    const positionMap = {
        top: '前',
        bottom: '后',
        center: '内',
    };
    return (
        <div
            ref={nodeRef}
            key={key}
            id={`treeNode_${key}`}
            className={[
                `id_${key}`,
                s[dropPosition],
                {
                    [s.treeNode]: true,
                    [s.selected]: isSelected,
                    [s.dragging]: isDragging,
                    [s.dragIn]: dragIn && draggingNode,
                    [s.unDraggable]: !draggable,
                    [s.hasDraggingNode]: !!draggingNode,
                    [s.unAccept]: !accept,
                },
            ]}
            draggable
            data-component-id={key}
            data-is-container={isContainer}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
        >
            {name}
            {dropPosition ? (
                <div className={s.dragGuide} style={{ display: dragIn && draggingNode ? 'flex' : 'none' }}>
                    <span>{positionMap[dropPosition]}</span>
                </div>
            ) : null}
        </div>
    );
});
