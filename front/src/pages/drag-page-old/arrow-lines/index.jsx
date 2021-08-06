import React, {useEffect} from 'react';
import config from 'src/commons/config-hoc';
import LinkPoint from 'src/pages/drag-page-old/link-point';
import styles from './style.less';
import {getEleCenterInWindow, findLinkTargetsPosition} from 'src/pages/drag-page-old/util';

export default config({
    connect: state => {
        return {
            pageConfig: state.dragPageOld.pageConfig,
            arrowLines: state.dragPageOld.arrowLines,
            showArrowLines: state.dragPageOld.showArrowLines,
            refreshArrowLines: state.dragPageOld.refreshArrowLines,

            selectedNode: state.dragPageOld.selectedNode,
            selectedNodeId: state.dragPageOld.selectedNodeId,
            iframeDocument: state.dragPageOld.iframeDocument,
        };
    },
})(function ArrowLines(props) {
    const {
        showArrowLines,
        refreshArrowLines,
        arrowLines,
        selectedNode,
        selectedNodeId,
        action: {dragPageOld: dragPageAction},
        pageConfig,
        iframeDocument,
    } = props;

    const propsToSet = selectedNode?.propsToSet;

    const sourceLinkPointEle = document.getElementById(`sourceLinkPoint_${selectedNode?.id}`);

    function getStyle(item) {
        const {
            startX,
            startY,
            endX,
            endY,
        } = item;

        const w = Math.abs(startX - endX);
        const h = Math.abs(startY - endY);

        // 勾股定理算长度
        const width = Math.sqrt(w * w + h * h);

        // 计算旋转角度

        // 右下
        let deg = Math.atan(h / w) * 180 / Math.PI;
        // 右上
        if (endX > startX && endY < startY) deg = -deg;
        // 左上
        if (endX < startX && endY < startY) deg = -(180 - deg);
        // 左下
        if (endX < startX && endY > startY) deg = 180 - deg;

        return {
            top: startY,
            left: startX,
            width: width,
            transform: `rotate(${deg}deg) scaleY(.5)`,
        };
    }

    function showAllArrowLines() {
        // 获取所有关联元素
        if (!propsToSet) return;

        const center = getEleCenterInWindow(sourceLinkPointEle);

        if (!center) return;

        const {x: startX, y: startY} = center;

        const all = findLinkTargetsPosition({
            pageConfig,
            selectedNode,
            iframeDocument,
        });

        const iframe = document.getElementById('dnd-iframe');
        const rect = iframe.getBoundingClientRect();
        const {x, y} = rect;

        all.forEach(item => {
            item.endX = item.endX + x;
            item.endY = item.endY + y;
            item.startX = startX;
            item.startY = startY;
            item.showEndPoint = true;
        });

        dragPageAction.setArrowLines(all);
    }

    // 显示隐藏
    useEffect(() => {
        if (showArrowLines) {
            showAllArrowLines();
        } else {
            dragPageAction.setArrowLines([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showArrowLines, refreshArrowLines]);

    // 选中节点更改，清空line
    useEffect(() => {
        dragPageAction.setArrowLines([]);
        dragPageAction.setShowArrowLines(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedNodeId]);

    // 设计页面滚动，刷新位置
    useEffect(() => {
        if (!iframeDocument) return;

        function handleScroll() {
            dragPageAction.setRefreshArrowLines({});
        }

        iframeDocument.body.addEventListener('scroll', handleScroll);

        return () => {
            iframeDocument.body.removeEventListener('scroll', handleScroll);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [iframeDocument]);


    return (
        <div>
            {arrowLines.map((item, index) => {
                const {
                    showEndPoint,
                    remove,
                    dragging,
                } = item;

                const style = getStyle(item);

                return (
                    <div
                        key={index}
                        className={{
                            [styles.root]: true,
                            [styles.showEndPoint]: showEndPoint,
                            [styles.remove]: remove,
                            [styles.dragging]: dragging,
                        }}
                        style={style}
                    >
                        <LinkPoint
                            className={styles.point}
                            movingPoint={item}
                            onClick={() => undefined} // 覆盖默认click事件
                        />
                    </div>
                );
            })}
        </div>
    );
});
