import React, {useState} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {findNodeById, deleteNodeById} from 'src/drag-page/util/node-util';
import {getComponentConfig, getComponentDisplayName} from 'src/drag-page/component-config';
import {actions, store} from 'src/models';
import s from './style.less';

const ReactNode = props => {
    const {
        node,
        draggingNode,
        value,
        onChange,
    } = props;

    const {pageConfig} = store.getState().dragPage;
    const dragPageAction = actions.dragPage;

    const [dragIn, setDragIn] = useState(false);

    function handleDragEnter(e) {
        setDragIn(true);
    }

    function handleDragOver(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        const {isNewAdd, nodeData} = draggingNode;
        const sourceNodeId = nodeData.id;

        setDragIn(false);
        dragPageAction.setDraggingNode(null);

        // 移动
        if (!isNewAdd) {
            // 拖过来的是 当前节点
            if (sourceNodeId === node.id) return;

            const sourceNode = findNodeById(pageConfig, sourceNodeId);
            // 拖过来的是当前节点的父级

            if (findNodeById(sourceNode, node.id)) return;

            // 删除拖过来的节点
            deleteNodeById(pageConfig, sourceNodeId);

            const {dragPage: dragPageAction} = actions;
            dragPageAction.render(true);

            // 等待属性改变完成，右侧表单更新
            setTimeout(() => onChange(sourceNode));
        }

        // 新增
        if (isNewAdd) {
            onChange(nodeData);
        }
    }

    function handleDragLeave(e) {
        setDragIn(false);
    }

    function handleClick(e) {
        if (value?.id) {
            dragPageAction.setSelectedNodeId(value.id);
        }
    }

    const cls = classNames({
        [s.root]: true,
        [s.dragIn]: dragIn,
    });

    const currentName = getComponentDisplayName(value);
    let icon = getComponentConfig(value?.componentName).icon;
    const placeholder = currentName ? <span>当前：{icon} {currentName}</span> : '请拖入组件';

    return (
        <div
            className={cls}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            {placeholder}
        </div>
    );
};

ReactNode.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func,
};

export default ReactNode;
