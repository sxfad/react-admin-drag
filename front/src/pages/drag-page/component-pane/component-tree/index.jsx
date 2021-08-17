import React, {useCallback, useRef, useMemo, useState, useEffect} from 'react';
import {Tooltip, Tree} from 'antd';
import {ArrowsAltOutlined, ShrinkOutlined} from '@ant-design/icons';
import Container from '../container';
import Header from '../header';
import Content from '../content';
import config from 'src/commons/config-hoc';
import {convertNodeToTreeData} from './util';
import s from './style.less';
import {findNodeById, findParentNodes} from 'src/pages/drag-page/util/node-util';
import {deleteNodeByKeyDown, scrollElement, useNodeChange, usePageConfigChange} from 'src/pages/drag-page/util';
import TreeNode from './TreeNode';

export default React.memo(config({
    connect: state => {
        return {
            pageConfig: state.dragPage.pageConfig,
            selectedNode: state.dragPage.selectedNode,
        };
    },
})(function ComponentTree(props) {
    const {
        icon,
        title,
        pageConfig,
        selectedNode,
        action: {dragPage: dragPageAction},
    } = props;

    const pageConfigRefresh = usePageConfigChange();
    const selectedNodeRefresh = useNodeChange(selectedNode);

    const [expandedKeys, setExpandedKeys] = useState([]);
    const [isAllExpanded, setIsAllExpanded] = useState(false);
    const contentRef = useRef(null);

    const {treeData = [], nodeCount = 0, allKeys = []} = useMemo(() => {
        if (!pageConfig) return {};

        // 无用，防止 hooks 提醒
        Object(pageConfigRefresh);
        return convertNodeToTreeData(pageConfig);
    }, [pageConfig, pageConfigRefresh]);

    const renderNode = useCallback((node) => {
        return (
            <TreeNode
                pageConfig={pageConfig}
                selectedKey={selectedNode?.id}
                node={node}
                expandedKeys={expandedKeys}
                onExpand={expandedKeys => setExpandedKeys(expandedKeys)}
            />
        );
    }, [selectedNode, expandedKeys, pageConfig]);

    const handleSelected = useCallback(([key]) => {
        if (!key) {
            dragPageAction.setFields({selectedNode: null});
            return;
        }
        const selectedNode = findNodeById(pageConfig, key);

        dragPageAction.setFields({selectedNode});
    }, [dragPageAction, pageConfig]);

    // 当有节点选中，展开对应父节点
    useEffect(() => {
        if (!treeData?.length) {
            setExpandedKeys([]);
            return;
        }
        const id = selectedNode?.id;

        const keys = findParentNodes(treeData[0], id).map(item => item.id) || [];

        setExpandedKeys(prevKeys => {
            // 去重
            return Array.from(new Set([...prevKeys, ...keys, id]));
        });
    }, [selectedNode, selectedNodeRefresh, treeData]);


    // 当有节点选中，树滚动到相应位置
    useEffect(() => {
        const containerEle = contentRef.current;
        if (!containerEle) return;

        const selectedNodeId = selectedNode?.id;
        const element = containerEle.querySelector(`#treeNode_${selectedNodeId}`);

        if (element) return scrollElement(containerEle, element);

        // 等待树展开
        setTimeout(() => {
            const element = containerEle.querySelector(`#treeNode_${selectedNodeId}`);

            scrollElement(containerEle, element);
        }, 200);

    }, [selectedNode, selectedNodeRefresh]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            deleteNodeByKeyDown(e, selectedNode?.id, document.activeElement, dragPageAction);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedNode, selectedNodeRefresh, dragPageAction]);

    return (
        <Container>
            <Header icon={icon} title={title}>
                <div className={s.header}>
                    <span>({nodeCount})</span>
                    <Tooltip placement="top" title={isAllExpanded ? '收起所有' : '展开所有'}>
                        <div
                            className={s.tool}
                            onClick={() => {
                                const nextKeys = isAllExpanded ? [] : allKeys;
                                setExpandedKeys(nextKeys);
                                setIsAllExpanded(!isAllExpanded);
                            }}
                        >
                            {isAllExpanded ? <ShrinkOutlined/> : <ArrowsAltOutlined/>}
                        </div>
                    </Tooltip>
                </div>
            </Header>
            <Content ref={contentRef}>
                <div className={s.root}>
                    <Tree
                        expandedKeys={expandedKeys}
                        onExpand={expandedKeys => setExpandedKeys(expandedKeys)}
                        blockNode

                        draggable
                        treeData={treeData}
                        titleRender={renderNode}

                        selectable
                        selectedKeys={[selectedNode?.id]}
                        onSelect={handleSelected}
                    />
                </div>
            </Content>
        </Container>
    );
}));
