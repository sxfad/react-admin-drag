import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Tooltip} from 'antd';
import {useThrottleFn} from 'ahooks';
import {AimOutlined} from '@ant-design/icons';
import {getEleCenterInWindow, findLinkTargetsPosition, getLinkLineStyle} from 'src/pages/drag-page/util';
import {findNodeById} from 'src/pages/drag-page/util/node-util';
import {cloneDeep} from 'lodash';
// import {v4 as uuid} from 'uuid';
import {throttle} from 'lodash';
import styles from './style.less';
import {getComponentConfig} from 'src/pages/drag-page/component-config';
import {store, actions} from 'src/models';

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

    const {canvasDocument} = store.getState().dragPage;
    const dragPageAction = actions.dragPage;


    const source = true;
    const targets = [];

    const id = props.id ? props.id : node?.id ? `sourceLinkPoint_${node?.id}` : undefined;
    const nodeConfig = getComponentConfig(node?.componentName);
    const propsToSet = node?.propsToSet || nodeConfig?.propsToSet;

    const startRef = useRef(null);
    const lineRef = useRef(null);
    const pointRef = useRef(null);
    const [dragging, setDragging] = useState(false);

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

        // 设置拖拽缩略图
        const img = new Image();
        e.dataTransfer.setDragImage(img, 0, 0);

        // 设置拖拽节点
        dragPageAction.setDraggingNode({
            dropType: 'props',
            propsToSet,
            config: {
                componentName: 'Text',
                props: {
                    text: '设置关联',
                },
            },
        });

    }, []);

    // 拖拽结束
    const handleDragEnd = useCallback(e => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        dragPageAction.setDraggingNode(null);
    }, []);

    // 原点点击事件
    const handleClick = useCallback(e => {

    });

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
    }, [canvasDocument, dragging]);

    const sourcePoint = (
        <div
            className={[
                className,
                styles.root,
                !targets?.length && styles.noLink,
            ].join(' ')}
            style={style}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={handleClick}
            id={id}
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

    if (!tip) return sourcePoint;

    return (
        <Tooltip
            title={tip}
            placement="top"
            getPopupContainer={() => document.body}
        >
            {sourcePoint}
        </Tooltip>
    );
}
