import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Tooltip} from 'antd';
import {useThrottleFn} from 'ahooks';
import {AimOutlined} from '@ant-design/icons';
import {getEleCenterInWindow, getLinkLineStyle, usePageConfigChange} from 'src/pages/drag-page/util';
import {findNodeById, loopNode} from 'src/pages/drag-page/util/node-util';
import styles from './style.less';
import {getComponentConfig, getComponentDisplayName} from 'src/pages/drag-page/component-config';
import {store, actions} from 'src/models';

function getLinkTarget(node, pageConfig, canvasDocument) {
    if (!node) return;

    const nodePageConfig = getComponentConfig(node.componentName);
    const propsToSet = node.propsToSet || nodePageConfig.propsToSet;

    if (!propsToSet) return;

    const iframe = document.getElementById('dnd-iframe');
    const rect = iframe.getBoundingClientRect();

    let result = [];

    loopNode(pageConfig, item => {
        Object.keys(propsToSet)
            .forEach(key => {
                if (!item.props) return;
                if (item.props[key] !== propsToSet[key]) return;

                const targetElement = canvasDocument.body.querySelector(`.id_${item.id}`);
                if (!targetElement) return;

                const {x, y} = getEleCenterInWindow(targetElement);

                result.push({
                    node: item,
                    centerPosition: {
                        x: x + rect.x,
                        y: y + rect.y,
                    },
                });
            });
    });

    return result;
}

/**
 *
 * targets
 * 本身就是一个source点，可以对应多个target
 *
 * */

export default function LinkPoint(props) {
    const {
        node,
        style, // 控制source点样式
        tip, // source点上鼠标悬停提示
        getTargets, // 获取 targets [{x,y}]，只有坐标信息
        lineVisible, // 连线是否可见
        className,
        ...others
    } = props;

    const pageConfigRefresh = usePageConfigChange();

    const {canvasDocument, pageConfig} = store.getState().dragPage;
    const dragPageAction = actions.dragPage;

    const [targets, setTargets] = useState([]);
    const [showTargets, setShowTargets] = useState(false);

    const id = props.id ? props.id : node?.id ? `sourceLinkPoint_${node?.id}` : undefined;
    const nodeConfig = getComponentConfig(node?.componentName);
    const propsToSet = node?.propsToSet || nodeConfig?.propsToSet;
    const sourceEle = document.getElementById(id);
    const sourcePosition = getEleCenterInWindow(sourceEle);

    const startRef = useRef(null);
    const lineRef = useRef(null);
    const pointRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    // 获取关联节点
    useEffect(() => {
        const targets = getLinkTarget(node, pageConfig, canvasDocument);
        setTargets(targets);
    }, [node, pageConfig, canvasDocument, pageConfigRefresh]);

    // 拖拽开始
    const handleDragStart = useCallback(e => {
        e && e.stopPropagation();

        if (!propsToSet) return;

        // 标记拖拽开始
        setDragging(true);

        // 获取拖拽开始位置
        const center = getEleCenterInWindow(e.target);
        if (center) {
            startRef.current = center;
        }

        // 设置拖拽缩略图为透明，不显示缩略图
        const img = new Image();
        img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=';
        img.width = 0;
        img.height = 0;
        e.dataTransfer.setDragImage(img, 0, 0);

        // 设置拖拽节点
        const nodeDisplayName = getComponentDisplayName(node);
        dragPageAction.setDraggingNode({
            dropType: 'props',
            propsToSet,
            tip: ({targetName}) => `将 ${nodeDisplayName} 与 ${targetName} 关联`,
            config: {
                componentName: 'Text',
                props: {
                    text: '设置关联',
                },
            },
        });
    }, [node, dragPageAction, propsToSet]);

    // 拖拽结束
    const handleDragEnd = useCallback(e => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        dragPageAction.setDraggingNode(null);

        // 如果移动的是target，则删除target关联
        const {targetId} = e.target.dataset;
        if (targetId) {
            const node = findNodeById(pageConfig, targetId);
            if (node) {
                const props = node.props || {};

                Object.entries(props)
                    .forEach(([key, value]) => {
                        if (value === propsToSet[key]) {
                            Reflect.deleteProperty(props, key);
                        }
                    });

                dragPageAction.updateNode(node);
            }
        }

        // 如果关联未显示，显示1s的关联
        if (!showTargets) {
            setShowTargets(true);
            setTimeout(() => setShowTargets(false), 1000);
        }
    }, [dragPageAction, showTargets, pageConfig, propsToSet]);

    // 原点点击，显示隐藏关联线
    const handleClick = useCallback(e => {
        setShowTargets(!showTargets);
    }, [showTargets]);

    // 显示拖拽中连线
    useEffect(() => {
        if (!dragging) {
            lineRef.current = null;
            return;
        }

        const lineEle = lineRef.current = document.createElement('div');
        lineEle.classList.add(styles.arrowLine);
        document.body.append(lineEle);

        return () => {
            lineEle.remove();
            lineRef.current = null;
        };
    }, [dragging]);

    // 更新拖拽过程中连线位置
    const {run: updateLinkLine} = useThrottleFn(({endX, endY}) => {
        const {x: startX, y: startY} = startRef.current;
        const linkLineStyle = getLinkLineStyle({
            startX,
            startY,
            endX,
            endY,
        });
        Object.entries(linkLineStyle)
            .forEach(([key, value]) => {
                lineRef.current.style[key] = value;
            });
    }, {wait: 1000 / 70, trailing: false});

    useEffect(() => {
        if (!canvasDocument) return;
        if (!dragging) return;

        const handleOver = (e) => {
            e.preventDefault();

            const {pageX, pageY, clientX, clientY} = e;
            const endX = pageX || clientX;
            const endY = pageY || clientY;

            updateLinkLine({endX, endY});
        };
        const handleCanvasOver = e => {
            e.preventDefault();

            const {pageX, pageY, clientX, clientY} = e;
            const documentElement = canvasDocument.documentElement || canvasDocument.body;
            const scrollX = documentElement.scrollLeft;
            const scrollY = documentElement.scrollTop;
            let endX = pageX - scrollX || clientX;
            let endY = pageY - scrollY || clientY;

            const iframe = document.getElementById('dnd-iframe');
            const rect = iframe.getBoundingClientRect();
            const {x, y} = rect;

            endX = endX + x;
            endY = endY + y;

            updateLinkLine({endX, endY});
        };

        // 捕获方式
        canvasDocument.addEventListener('dragover', handleCanvasOver, true);
        window.addEventListener('dragover', handleOver, true);
        return () => {
            canvasDocument.removeEventListener('dragover', handleCanvasOver, true);
            window.removeEventListener('dragover', handleOver, true);
        };
    }, [canvasDocument, updateLinkLine, dragging]);

    const point = (source, targetId) => (
        <div
            className={[
                className,
                styles.root,
                !targets?.length && styles.noLink,
            ]}
            style={style}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={handleClick}
            id={id}
            data-target-id={targetId}
            {...others}
        >
            {source ? (
                <div
                    className={styles.sourcePoint}
                    ref={pointRef}
                >
                    <AimOutlined/>
                </div>
            ) : (
                <div className={styles.point} ref={pointRef}/>
            )}
        </div>
    );

    const _showTargets = showTargets || dragging;

    return (
        <>
            {tip ? (
                <Tooltip
                    title={tip}
                    placement="top"
                    getPopupContainer={() => document.body}
                >
                    {point(true)}
                </Tooltip>
            ) : point(true)}

            {_showTargets && targets.map(item => {
                const {node: {id}, centerPosition: {x, y}} = item;
                const style = {
                    position: 'fixed',
                    zIndex: 9999,
                    left: x - 10,
                    top: y - 10,
                };
                const linkLineStyle = getLinkLineStyle({
                    startX: sourcePosition.x,
                    startY: sourcePosition.y,
                    endX: x,
                    endY: y,
                });
                return (
                    <div
                        key={id}
                        style={style}
                    >
                        <div
                            className={styles.arrowLine}
                            style={linkLineStyle}
                        />
                        {point(false, id)}
                    </div>
                );
            })}
        </>
    );
}
