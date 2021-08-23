import React, {useRef, useEffect, useState} from 'react';
import {Button} from 'antd';
import {useDebounceFn} from 'ahooks';
import config from 'src/commons/config-hoc';
import {getComponentConfig} from 'src/drag-page/component-config';
import {PropsFormEditor, PropsCodeEditor} from 'src/drag-page/components';
import {isNode} from 'src/drag-page/util/node-util';

export default React.memo(config({
    connect: state => {
        return {
            selectedNode: state.dragPage.selectedNode,
            propsPaneWidth: state.dragPage.propsPaneWidth,
            refreshPropsPane: state.dragPage.refreshPropsPane,
        };
    },
})(function ComponentProps(props) {
    const {
        height,
        propsPaneWidth,
        selectedNode,
        codeVisible,
        onCodeCancel,
        action: {dragPage: dragPageAction},
    } = props;

    // 相关属性节点
    const propsNodes = selectedNode?.props ? Object.entries(selectedNode?.props)
        .filter(([, value]) => isNode(value)) : [];

    // 相关文本节点
    let TextNode = selectedNode?.children?.find(item => item.componentName === 'Text');

    // 相关包裹节点
    const wrapperNodes = selectedNode?.wrapper || [];

    const rootRef = useRef(null);
    const [editNode, setEditNode] = useState(null);

    const {run: handleChange} = useDebounceFn((node, allValues, replace) => {
        if (!node?.componentName) return;

        if (!node?.props) node.props = {};

        Object.entries(allValues)
            .forEach(([key, value]) => {
                if (value?.changeChildren) {
                    node.children = value.children;
                    Reflect.deleteProperty(value, key);
                }
            });

        node.props = replace ? allValues : {
            ...node.props,
            ...allValues,
            // key: uuid(),
        };
        // 清除空属性
        Object.entries(node.props)
            .forEach(([key, value]) => {
                // null 不要删，modal footer null 是个有效属性
                if (value === undefined || value === ''/* || value === null*/) {
                    Reflect.deleteProperty(node.props, key);
                }
            });

        const nodeConfig = getComponentConfig(node.componentName);

        const options = node.props.options || [];

        options.forEach(item => {
            Reflect.deleteProperty(item, '_form');
        });

        const afterPropsChange = nodeConfig?.hooks?.afterPropsChange;
        afterPropsChange && afterPropsChange({node: node, dragPageAction});

        console.log('props', JSON.stringify(node.props, null, 4));
        dragPageAction.updateNode(node);
    }, {wait: 300, leading: true});

    function handleDeleteWrapper(index) {
        selectedNode.wrapper.splice(index, 1);
        dragPageAction.updateNode(selectedNode);
    }

    function handleDeleteProps(key) {
        Reflect.deleteProperty(selectedNode.props, key);
        dragPageAction.updateNode(selectedNode);
    }

    function handleEdit(node) {
        setEditNode(node);
    }

    // 编辑当前选中节点
    useEffect(() => {
        setEditNode(selectedNode);
    }, [selectedNode]);

    // 将属性面板滚动到顶部，并隐藏滚动条
    useEffect(() => {
        const rootEle = rootRef.current;

        if (!rootEle) return;
        // if (!editNode) return;
        //
        // const editorRootEle = document.getElementById(`fieldEditor_${editNode.id}`);
        // if (!editorRootEle) return;
        //
        // rootEle.style.overflow = codeVisible ? 'hidden' : 'auto';

        // scrollElement(rootEle, editorRootEle, true, true);
        rootEle.scrollTop = 0;

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [codeVisible, editNode, rootRef.current]);

    return (
        <div ref={rootRef} style={{height, overflow: 'auto'}}>
            {codeVisible ? (
                <PropsCodeEditor
                    onChange={values => handleChange(editNode, values, true)}
                    onCancel={onCodeCancel}
                    node={editNode}
                    editorWidth={propsPaneWidth}
                />
            ) : (
                <div>
                    {TextNode ? (
                        <section id={`fieldEditor_${TextNode?.id}`}>
                            <PropsFormEditor
                                tip="文本内容："
                                node={{...TextNode}}
                                onCodeEdit={() => handleEdit(TextNode)}
                                onChange={(...args) => handleChange(TextNode, ...args)}
                            />
                        </section>
                    ) : null}

                    <section id={`fieldEditor_${selectedNode?.id}`}>
                        <PropsFormEditor
                            node={{...selectedNode}}
                            onCodeEdit={() => handleEdit(selectedNode)}
                            onChange={(...args) => handleChange(selectedNode, ...args)}
                        />
                    </section>

                    {wrapperNodes.map((node, index) => {
                        const isLast = !propsNodes.length && index === wrapperNodes.length - 1;
                        return (
                            <section key={node.id} id={`fieldEditor_${node.id}`} style={{height: isLast ? '100%' : 'auto'}}>
                                <PropsFormEditor
                                    tip="相关包裹："
                                    tool={(
                                        <Button
                                            style={{marginRight: 8}}
                                            type="text"
                                            danger
                                            onClick={() => handleDeleteWrapper(index)}
                                        >删除</Button>
                                    )}
                                    node={{...node}}
                                    onCodeEdit={() => handleEdit(node)}
                                    onChange={(...args) => handleChange(node, ...args)}
                                />
                            </section>
                        );
                    })}

                    {propsNodes.map(([key, node], index) => {
                        const isLast = index === propsNodes.length - 1;

                        return (
                            <section key={node.id} id={`fieldEditor_${node.id}`} style={{height: isLast ? '100%' : 'auto'}}>
                                <PropsFormEditor
                                    tip={`相关属性「${key}」：`}
                                    tool={(
                                        <Button
                                            style={{marginRight: 8}}
                                            type="text"
                                            danger
                                            onClick={() => handleDeleteProps(key)}
                                        >删除</Button>
                                    )}
                                    node={{...node}}
                                    onCodeEdit={() => handleEdit(node)}
                                    onChange={(...args) => handleChange(node, ...args)}
                                />
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
}));
