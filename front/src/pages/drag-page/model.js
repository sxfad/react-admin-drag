import {v4 as uuid} from 'uuid';
import {
    deleteNodeById, findNodeById,
    findParentNodeById,
    insertAfter,
    insertBefore,
    insertChildren, loopNode, replaceNode,
    setNodeId,
} from 'src/pages/drag-page/util/node-util';
import {addDragHolder, emitUpdateNodes} from 'src/pages/drag-page/util';
import {getComponentConfig} from 'src/pages/drag-page/component-config';
import {cloneDeep} from 'lodash';

const rootNode = () => ({
    id: uuid(),
    componentName: 'DragHolder',
    props: {
        style: {height: '500px'},
    },
});

export default {
    state: {
        // 视图模式 布局模式 layout 预览模式 preview
        viewMode: 'layout',
        // 是否显示页面源码
        pageCodeVisible: false,
        // 是否显示页面整体配置
        pageConfigVisible: false,

        // 组件面板是否展开
        componentPaneExpended: true,
        // 组件面板宽度
        componentPaneWidth: 300,
        // 组件面板激活key
        componentPaneActiveKey: 'componentStore',

        // 属性面板是否展开
        propsPaneExpended: true,
        // 属性面板宽度
        propsPaneWidth: 400,
        // 属性面板激活key
        propsPaneActiveKey: 'props',

        // 当前选中节点
        selectedNode: null,
        // 画布上节点选中方式 click: 单击 or  meta: mate(ctrl) + 单击
        nodeSelectType: 'meta',
        // 当前拖拽节点
        draggingNode: null,
        // 当前拖拽节点对应的dom元素
        draggingElement: null,
        // 投放目标节点
        targetNode: null,
        // 悬停目标节点的位置 top right bottom left center
        targetHoverPosition: 'children',

        // 组件库下拉
        stores: [],
        // 当前选中组价库
        selectedStoreId: 'base',
        // 当前选中组件库分类Id
        selectedSubCategoryId: null,
        // 分类滚动方式，无论是否可见都强制滚动
        categoryScrollType: 'byClick',

        // 页面尺寸
        pageWidth: 'auto',
        pageHeight: '100%',
        // 画布尺寸
        canvasWidth: 2200,
        canvasHeight: 2000,
        // 画布缩放
        canvasScale: 100,
        // 画布document节点
        canvasDocument: null,
        // 画布上渲染组件根节点
        pageRenderRoot: null,

        // 渲染页面的配置
        pageConfig: rootNode(),
        // 页面中state数据 state.
        pageState: {},
        // 页面state默认值
        pageStateDefault: {},
        // 页面中函数 func.
        pageFunction: {},
        // 页面中变量 variable.
        pageVariable: {},
    },

    // 同步localStorage
    syncLocal: [
        'pageConfig',
        'pageState',
        'pageStateDefault',
        'pageFunction',
        'pageVariable',
        'viewMode',

        'componentPaneWidth',
        'componentPaneActiveKey',
        'componentPaneExpended',

        'propsPaneActiveKey',
        'propsPaneWidth',
        'propsPaneExpended',
    ],

    setFields: fields => ({...fields}),

    // 组件另存为
    saveSelectedNodeAs() {
        // TODO
        console.log('saveSelectedNodeAs');
    },

    // 保存页面配置到服务端
    savePageConfig() {
        // TODO
        console.log('savePageConfig');
    },

    // 撤销
    undo() {
        // TODO
        console.log('undo');
    },

    // 重做
    redo() {
        // TODO
        console.log('redo');
    },

    setDraggingNode: draggingNode => {
        if (!draggingNode) return {draggingNode: null};

        let {config, type, dropType} = draggingNode;

        const nodeConfig = getComponentConfig(config?.componentName) || {};
        const {isWrapper} = nodeConfig;
        const propsToSet = config?.propsToSet || draggingNode?.propsToSet || nodeConfig?.propsToSet;

        let dropTypeChangeable = true;
        if (propsToSet) dropType = 'props';
        if (isWrapper) {
            dropTypeChangeable = false;
            dropType = 'wrapper';
        }

        return {
            draggingNode: {
                ...draggingNode,
                id: config?.id,
                type,
                config,
                propsToSet: cloneDeep(propsToSet),
                dropTypeChangeable,
                dropType: dropType,
            },
        };
    },
    // 设置页面state
    setPageState(data, state) {
        const {pageState} = state;

        return {
            pageState: {...pageState, ...data},
        };
    },

    // 设置页面函数
    setPageFunction(data, state) {
        const {pageFunction} = state;

        return {
            pageFunction: {...pageFunction, ...data},
        };
    },

    // 设置页面变量
    setPageVariable(data, state) {
        const {pageVariable} = state;

        return {
            pageVariable: {...pageVariable, ...data},
        };
    },

    /**
     * 发布订阅方式更新具体节点
     * @param node
     */
    updateNode(node) {
        emitUpdateNodes([
            {
                id: node?.id,
                type: 'update',
            },
        ]);
    },

    /**
     * 发布订阅方式更新具体节点
     * @param node
     * @param state
     */
    updateParentNode(node, state) {
        const {pageConfig} = state;
        const parentNode = findParentNodeById(pageConfig, node?.id);
        emitUpdateNodes([
            {
                id: parentNode?.id,
                type: 'update',
            },
        ]);
    },
    /**
     * 插入节点
     * draggingNode 是否能插入 targetNode 在targetNode获取函数中已经检测过，包裹各种插入类型
     * 插入类型 dropType：
     *  new || move
     *      before 在targetNode之前插入
     *      after 在targetNode之前插入
     *      children 作为 targetNode children
     *  props 作为 targetNode某个属性 快捷键 Alt
     *  wrapper 作为 target的wrapper，快捷键：Ctrl或meta 本质上渲染成target的父级，移动时随targetNode一起
     *  replace 替换targetNode 快捷键：Shift
     * @param _
     * @param state
     */
    insertNode({draggingNode: _draggingNode, targetNode, targetHoverPosition}, state) {
        const {pageConfig, selectedNode} = state;
        let {config: draggingNode, dropType, propsToSet} = _draggingNode;
        let nextSelectedNode = null;
        // 根节点为站位符时，直接替换
        if (pageConfig.componentName === 'DragHolder') {
            return {
                pageConfig: draggingNode,
                selectedNode: draggingNode,
            };
        }

        if (!targetNode) return null;
        const targetNodeConfig = getComponentConfig(targetNode?.componentName);

        const targetParentNode = findParentNodeById(pageConfig, targetNode?.id);
        const targetParentNodeConfig = getComponentConfig(targetParentNode?.componentName);

        const draggingParentNode = findParentNodeById(pageConfig, draggingNode?.id);
        const draggingNodeConfig = getComponentConfig(draggingNode?.componentName);

        const {
            beforeAdd = () => undefined,
            afterAdd = () => undefined,
        } = (draggingNodeConfig?.hooks || {});

        let beforeAddState;
        let afterAddState;

        const {
            beforeAddChildren = () => undefined,
            afterAddChildren = () => undefined,
        } = (targetNodeConfig?.hooks || {});

        let beforeAddChildrenState;
        let afterAddChildrenState;

        beforeAddState = beforeAdd({dragPageState: state, node: draggingNode, parentNode: draggingParentNode});
        if (beforeAddState === false) return null;

        const {
            beforeAddChildren: parentBeforeAddChildren = () => undefined,
            afterAddChildren: parentAfterAddChildren = () => undefined,
        } = (targetParentNodeConfig?.hooks || {});

        let parentBeforeAddChildrenState;
        let parentAfterAddChildrenState;

        // 节点上propsToSet优先
        if (draggingNode.propsToSet) {
            propsToSet = draggingNode.propsToSet;
        }

        // 设置属性 state func node等都有可能
        if (dropType === 'props' && propsToSet) {
            if (!targetNode.props) targetNode.props = {};

            // 可能会有节点，尝试设置id
            setNodeId(propsToSet);

            Object.entries(propsToSet)
                .forEach(([key, value]) => {
                    targetNode.props[key] = value;
                });

            nextSelectedNode = selectedNode;
            // 发布订阅方式更新具体节点
            emitUpdateNodes([
                {
                    id: targetNode?.id,
                    type: 'update',
                },
            ]);
        }

        if (dropType === 'wrapper') {
            // 移除拖动节点
            deleteNodeById(pageConfig, draggingNode?.id);

            if (!targetNode?.wrapper?.length) targetNode.wrapper = [];

            targetNode.wrapper.push(draggingNode);

            nextSelectedNode = draggingNode;

            // 发布订阅方式更新具体节点
            emitUpdateNodes([
                {
                    id: targetNode?.id,
                    type: 'update',
                },
            ]);
        }

        if (dropType === 'replace') {
            // 保留wrapper
            draggingNode.wrapper = targetNode.wrapper;

            replaceNode(pageConfig, draggingNode, targetNode);

            nextSelectedNode = draggingNode;

            // 发布订阅方式更新具体节点
            emitUpdateNodes([
                {
                    id: targetParentNode?.id,
                    type: 'update',
                },
            ]);
        }

        if (!dropType) {
            const targetNodeId = targetNode.id;

            const isBefore = ['top', 'left'].includes(targetHoverPosition);
            const isAfter = ['right', 'bottom'].includes(targetHoverPosition);
            const isChildren = ['center'].includes(targetHoverPosition);

            if (isBefore || isAfter) {
                const args = {node: targetParentNode, childNode: draggingNode, dragPageState: state};
                parentBeforeAddChildrenState = parentBeforeAddChildren(args);

                if (parentBeforeAddChildrenState === false) return null;

                // 方法内部会做： 如果存在，先删除，相当于移动位置
                isBefore && insertBefore(pageConfig, draggingNode, targetNodeId);
                isAfter && insertAfter(pageConfig, draggingNode, targetNodeId);

                nextSelectedNode = draggingNode;

                // 发布订阅方式更新具体节点
                emitUpdateNodes([
                    {
                        id: targetParentNode?.id,
                        type: 'update',
                    },
                ]);

                parentAfterAddChildrenState = parentAfterAddChildren(args);

            }

            if (isChildren) {
                // 清除占位符
                if (targetNode?.children?.length === 1
                    && targetNode.children[0].componentName === 'DragHolder'
                ) {
                    // 需要保持保持children引用
                    targetNode.children.pop();
                }

                const args = {node: targetNode, childNode: draggingNode, dragPageState: state};
                beforeAddChildrenState = beforeAddChildren(args);

                if (beforeAddChildrenState === false) return null;

                insertChildren(pageConfig, draggingNode, targetNode);

                nextSelectedNode = draggingNode;

                // 发布订阅方式更新具体节点
                emitUpdateNodes([
                    {
                        id: targetNode?.id,
                        type: 'update',
                    },
                ]);

                afterAddChildrenState = afterAddChildren(args);
            }
        }

        // 节点被拖拽出去之后，尝试给父级添加DragHolder
        addDragHolder(draggingParentNode);

        // 发布订阅方式更新具体节点
        emitUpdateNodes([
            {
                id: draggingParentNode?.id,
                type: 'update',
            },
        ]);

        afterAddState = afterAdd({dragPageState: state, node: draggingNode, parentNode: draggingParentNode});

        return {
            // 选中刚拖拽的节点
            selectedNode: nextSelectedNode,
            ...beforeAddState,
            ...afterAddState,
            ...beforeAddChildrenState,
            ...afterAddChildrenState,
            ...parentBeforeAddChildrenState,
            ...parentAfterAddChildrenState,
        };
    },
    /**
     * 根据id删除节点
     */
    deleteNodeById(id, state) {
        const {pageConfig} = state;
        const selectedNode = findNodeById(pageConfig, id);
        if (!selectedNode) return null;

        const nodeConfig = getComponentConfig(selectedNode?.componentName);
        const parentNode = findParentNodeById(pageConfig, selectedNode?.id);
        const parentNodeConfig = getComponentConfig(parentNode?.componentName);

        const {
            beforeDelete = () => undefined,
            afterDelete = () => undefined,
        } = nodeConfig?.hooks || {};
        const {
            beforeDeleteChildren = () => undefined,
            afterDeleteChildren = () => undefined,
        } = parentNodeConfig?.hooks || {};

        let beforeDeleteState;
        let afterDeleteState;
        let beforeDeleteChildrenState;
        let afterDeleteChildrenState;


        beforeDeleteState = beforeDelete({dragPageState: state, node: selectedNode, parentNode: parentNode});
        if (beforeDeleteState === false) return null;

        beforeDeleteChildrenState = beforeDeleteChildren({dragPageState: state, node: parentNode, childNode: selectedNode});
        if (beforeDeleteChildrenState === false) return null;

        // 删除的是跟节点
        if (selectedNode.id === pageConfig.id) {
            return {
                pageConfig: rootNode(),
                selectedNode: null,
                pageState: {},
                pageStateDefault: {},
                pageFunction: {},
                pageVariable: {},
            };
        }

        const children = parentNode?.children || [];

        const deleteIndex = children.findIndex(item => item.id === selectedNode?.id);

        deleteNodeById(pageConfig, selectedNode?.id);
        // 节点被拖拽出去之后，尝试给父级添加DragHolder
        addDragHolder(parentNode);

        // 更新节点
        emitUpdateNodes([
            {
                id: parentNode?.id,
                type: 'update',
            },
        ]);

        afterDeleteState = afterDelete({dragPageState: state, node: selectedNode, parentNode: parentNode});
        afterDeleteChildrenState = afterDeleteChildren({dragPageState: state, node: parentNode, childNode: selectedNode});

        // 没有子节点了，选中父节点
        if (!children?.length) {
            return {
                selectedNode: parentNode,
            };
        }
        // 选择下一个兄弟节点 或 上一个兄弟节点
        const nextNode = children[deleteIndex];
        const prevNode = children[deleteIndex - 1];

        // 修复 pageState pageFunction pageVariable
        const stateKeys = [];
        const functionKeys = [];
        const variableKeys = [];

        loopNode(pageConfig, node => {
            const props = node.props || {};
            console.log(props);
            Object.values(props)
                .forEach(value => {
                    if (typeof value !== 'string') return;

                    if (value.startsWith('state.')) stateKeys.push(value.replace('state.', ''));
                    if (value.startsWith('func.')) functionKeys.push(value.replace('func.', ''));
                    if (value.startsWith('variable.')) variableKeys.push(value.replace('variable.', ''));
                });
        });

        const deleteKey = (keys, obj) => {
            if (!obj) return;
            Object.keys(obj)
                .forEach(key => {
                    if (!keys.includes(key)) Reflect.deleteProperty(obj, key);
                });
        };

        const nextState = {
            ...state,
            selectedNode: nextNode || prevNode,
            ...beforeDeleteState,
            ...afterDeleteState,
            ...beforeDeleteChildrenState,
            ...afterDeleteChildrenState,
        };

        const {
            pageState,
            pageStateDefault,
            pageFunction,
            pageVariable,
        } = nextState;

        deleteKey(stateKeys, pageState);
        deleteKey(stateKeys, pageStateDefault);
        deleteKey(functionKeys, pageFunction);
        deleteKey(variableKeys, pageVariable);

        return {
            ...nextState,
            pageState: {...pageState},
            pageStateDefault: {...pageStateDefault},
            pageFunction: {...pageFunction},
            pageVariable: {...pageVariable},
        };
    },
};
