import React, {useEffect, useState, useRef} from 'react';
import {message, Switch} from 'antd';
import JSON5 from 'json5';
import config from 'src/commons/config-hoc';
import {CodeEditor} from 'src/pages/drag-page/components';
import {isFunctionString} from 'src/pages/drag-page/util';
import {
    findNodeById,
    deleteNodeId,
    setNodeId,
    loopNode,
} from 'src/pages/drag-page/util/node-util';
import {deleteDefaultProps, getComponentConfig} from 'src/pages/drag-page/component-config';
import {cloneDeep} from 'lodash';
import s from './style.less';

const EDIT_TYPE = {
    CURRENT_NODE: 'CURRENT_NODE',
    ALL: 'ALL',
};

export default config({
    connect: state => {
        return {
            pageConfig: state.dragPage.pageConfig,
            selectedNode: state.dragPage.selectedNode,
            componentPaneWidth: state.dragPage.componentPaneWidth,
        };
    },
})(function SchemaEditor(props) {
    const {
        pageConfig,
        selectedNode,
        visible,
        componentPaneWidth,
        action: {dragPage: dragPageAction},
    } = props;

    const [editType, setEditType] = useState(EDIT_TYPE.CURRENT_NODE);
    const [code, setCode] = useState('');
    const saveRef = useRef(false);

    // 将代码转换为对象
    function codeToObject(code) {
        if (!code) return null;

        const val = code.replace('export', '').replace('default', '');
        try {
            let obj;
            // 直接通过eval执行，保留函数
            // eslint-disable-next-line
            eval(`obj = ${val}`);

            if (typeof obj !== 'object' || Array.isArray(obj)) {
                return Error('语法错误，请修改后保存！');
            }

            const loopComponentName = node => {
                if (!node.componentName) return false;

                if (node?.children?.length) {
                    for (let item of node.children) {
                        const result = loopComponentName(item);
                        if (result === false) return result;
                    }
                }

                return true;
            };

            if (!loopComponentName(obj)) return Error('缺少必填字段「componentName」!');

            // 函数转字符串
            const loopFunction = node => {
                Object.entries(node)
                    .forEach(([key, value]) => {
                        if (typeof value === 'function') {
                            node[key] = value.toString();
                        }
                        if (Array.isArray(value)) {
                            value.forEach(item => loopFunction(item));
                        }
                        if (typeof value === 'object' && value && !Array.isArray(value)) {
                            loopFunction(value);
                        }
                    });
            };

            loopFunction(obj);

            return obj;
        } catch (e) {
            console.error(e);
            return Error('语法错误，请修改后保存！');
        }
    }

    function handleSave(value, errors) {
        if (errors?.length) return message.error('语法错误，请修改后保存！');

        const nodeConfig = codeToObject(value);
        if (nodeConfig instanceof Error) return message.error(nodeConfig.message);

        let nextPageConfig;

        // 编辑单独节点
        if (editType !== EDIT_TYPE.ALL) {
            // 删除所有数据，保留引用
            Object.keys(selectedNode).forEach(key => {

                // 不删除
                if (['id'].includes(key)) return;

                Reflect.deleteProperty(selectedNode, key);
            });
            // 赋值
            Object.entries(nodeConfig).forEach(([key, value]) => {
                selectedNode[key] = value;
            });
            nextPageConfig = pageConfig;
        } else {
            nextPageConfig = nodeConfig;
        }

        // id 不存在，则设置新的id
        setNodeId(nextPageConfig);

        saveRef.current = true;

        dragPageAction.setFields({pageConfig: {...nextPageConfig}});
        //
        const nextSelectedNode = findNodeById(nextPageConfig, selectedNode?.id);
        console.log(nextSelectedNode);
        // dragPageAction.setSelectedNodeId(nextSelectedNode?.id);

        return message.success('保存成功！');
    }

    function handleClose() {
        dragPageAction.setFields({componentPaneExpended: false});
    }

    useEffect(() => {
        if (!visible) return;
        // 由于保存触发的，不做任何处理
        if (saveRef.current) {
            saveRef.current = false;
            return;
        }

        const allNodes = cloneDeep(pageConfig);
        const node = cloneDeep(selectedNode);

        let editNode;
        if (editType === EDIT_TYPE.CURRENT_NODE) editNode = node;
        if (editType === EDIT_TYPE.ALL) editNode = allNodes;

        if (!editNode) {
            setEditType(EDIT_TYPE.ALL);
            return;
        }

        // 清除默认值
        deleteDefaultProps(editNode);

        // 清除所有id
        deleteNodeId(editNode);

        // 函数处理成非字符串形式
        const FUNCTION_HOLDER = '___function___';
        loopNode(editNode, node => {
            const nodeConfig = getComponentConfig(node.componentName);
            const beforeSchemaEdit = nodeConfig?.hooks?.beforeSchemaEdit;
            beforeSchemaEdit && beforeSchemaEdit({node});
            if (node.props) {
                Object.entries(node.props)
                    .forEach(([key, value]) => {
                        if (isFunctionString(value)) {
                            let fn;
                            // eslint-disable-next-line
                            eval(`fn = ${value}`);
                            if (typeof fn === 'function') {
                                node.props[key] = `${FUNCTION_HOLDER}${value}${FUNCTION_HOLDER}`;
                            }
                        }
                    });
            }
        });

        // 拼接代码
        let nextCode = `export default ${JSON5.stringify(editNode, null, 2)}`;
        nextCode = nextCode.replace(RegExp(`'${FUNCTION_HOLDER}`, 'g'), '');
        nextCode = nextCode.replace(RegExp(`${FUNCTION_HOLDER}'`, 'g'), '');
        nextCode = nextCode.replace(/\\n/g, '\n');

        setCode(nextCode);
    }, [visible, editType, selectedNode, pageConfig]);

    if (!visible) return null;

    return (
        <div className={s.root} id="schemaEditor">
            <CodeEditor
                editorWidth={componentPaneWidth}
                title={(
                    <div className={s.title}>
                        <span style={{marginRight: 8}}>Schema 源码开发</span>
                        <Switch
                            checkedChildren="选中"
                            unCheckedChildren="全部"
                            checked={editType === EDIT_TYPE.CURRENT_NODE}
                            onChange={checked => setEditType(checked ? EDIT_TYPE.CURRENT_NODE : EDIT_TYPE.ALL)}
                        />
                    </div>
                )}
                value={code}
                onSave={handleSave}
                onClose={handleClose}
            />
        </div>
    );
});
