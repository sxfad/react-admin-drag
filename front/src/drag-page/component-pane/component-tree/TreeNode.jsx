import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {useThrottleFn} from 'ahooks';
import config from 'src/commons/config-hoc';
import {getTargetNode, setDragImage} from 'src/drag-page/util';

import s from './style.less';
import {LinkPoint} from 'src/drag-page/components';

export default config({
    connect: state => {
        return {
            draggingNode: state.dragPage.draggingNode,
            targetNode: state.dragPage.targetNode,
            targetHoverPosition: state.dragPage.targetHoverPosition,
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
        targetNode,
        targetHoverPosition,

        action: {dragPage: dragPageAction},
    } = props;

    let {key, name, icon, draggable, nodeData} = node;
    const [unAccept, setUnAccept] = useState(false);

    name = <span className={s.nodeTitle}>{icon}{name}</span>;

    const hoverPosition = useMemo(() => {
        if (targetHoverPosition === 'left') return 'top';
        if (targetHoverPosition === 'right') return 'bottom';

        return targetHoverPosition;

    }, [targetHoverPosition]);

    const hoverRef = useRef(0);
    const [dragIn, setDragIn] = useState(false);

    useEffect(() => {
        if (!targetNode && dragIn) {
            setUnAccept(true);
            return () => {
                setUnAccept(false);
            };
        }

        if (targetNode?.id === key) {
            setDragIn(true);
            setUnAccept(false);

            return () => {
                setDragIn(false);
                setUnAccept(true);
            };
        }
    }, [targetNode, dragIn, key]);

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
        setDragImage(e);
    }, [dragPageAction, draggable, nodeData]);

    const THROTTLE_TIME = 100;
    const {run: throttleOver} = useThrottleFn(e => {
        setDragIn(true);
        const element = e.target;

        if (!element) return;

        const {pageY, pageX} = e;
        const {documentElement} = document;
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
            horizontal: false,
            simple: true,
        }) || {targetNode: null, targetElement: null};

        // ???????????????????????????
        if (draggingNode?.id === key) {
            dragPageAction.setFields({
                targetNode: null,
                targetHoverPosition: null,
            });
            return;
        }

        // ???????????????????????????hover????????????????????????
        if (targetNode?.id !== key) {
            dragPageAction.setFields({
                targetNode: null,
                targetHoverPosition: null,
            });
            return;
        }

        // 1s ???????????????
        if (!hoverRef.current) {
            hoverRef.current = setTimeout(() => {
                if (!expandedKeys.some(k => k === key)) {
                    onExpand([...expandedKeys, key]);
                }
            }, 300);
        }

        dragPageAction.setFields({
            targetNode,
            targetHoverPosition,
        });

    }, {wait: THROTTLE_TIME, trailing: false});

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!draggingNode || !draggable) return;
        const {dropType, type} = draggingNode;

        let cursor = 'move';

        if (type === 'new') cursor = 'copy';

        if (['props', 'replace', 'wrapper'].includes(dropType)) cursor = 'link';

        e.dataTransfer.dropEffect = cursor;

        throttleOver(e);
    }, [draggingNode, throttleOver, draggable]);

    const handleDragLeave = useCallback((e) => {
        setDragIn(false);
        if (!draggable) return;

        if (hoverRef.current) {
            clearTimeout(hoverRef.current);
            hoverRef.current = 0;
        }
    }, [draggable]);

    const handleDragEnd = useCallback(() => {
        setDragIn(false);
        if (!draggable) return;

        if (hoverRef.current) {
            clearTimeout(hoverRef.current);
            hoverRef.current = 0;
        }

        dragPageAction.setDraggingNode(null);
        dragPageAction.setFields({targetNode: null, targetHoverPosition: null});
    }, [dragPageAction, draggable]);

    const handleDrop = useCallback((e) => {
        const end = () => {
            handleDragLeave(e);
            handleDragEnd();
        };

        if (!draggable) return end();

        e.preventDefault();
        e.stopPropagation();


        dragPageAction.insertNode({
            draggingNode,
            targetNode,
            targetHoverPosition,
        });

        end();

    }, [dragPageAction, draggingNode, targetHoverPosition, targetNode, draggable, handleDragEnd, handleDragLeave]);

    const isSelected = selectedKey === key;
    const isDragging = draggingNode?.id === key;

    const positionMap = {
        top: '???',
        bottom: '???',
        center: '???',
    };
    const className = [
        `id_${key}`,
        s[hoverPosition],
        {
            [s.treeNode]: true,
            [s.selected]: isSelected,
            [s.dragging]: isDragging,
            [s.dragIn]: dragIn && draggingNode,
            [s.unDraggable]: !draggable,
            [s.hasDraggingNode]: !!draggingNode,
            [s.unAccept]: unAccept,
        },
    ];
    return (
        <div
            key={key}
            id={`treeNode_${key}`}
            className={className}
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
        >
            {name}
            <LinkPoint
                node={nodeData}
                style={{marginRight: 4}}
            />
            {hoverPosition ? (
                <div className={s.dragGuide} style={{display: dragIn && draggingNode ? 'flex' : 'none'}}>
                    <span>{positionMap[hoverPosition]}</span>
                </div>
            ) : null}
        </div>
    );
});
