import { v4 as uuid } from 'uuid';
import {
    deleteNodeById, findNodeById,
    findParentNodeById,
    insertAfter,
    insertBefore,
    insertChildren, replaceNode,
    setNodeId,
} from 'src/pages/drag-page/util/node-util';
import { addDragHolder } from 'src/pages/drag-page/util';
import { getComponentConfig } from 'src/pages/drag-page/component-config';
import { cloneDeep } from 'lodash';

const rootNode = () => ({
    id: uuid(),
    componentName: 'DragHolder',
    props: {
        style: { height: '500px' },
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

        // 是否显示组件配置
        componentConfigVisible: false,
        // 组件面板宽度
        componentPaneWidth: 300,
        // 组件面板激活key
        componentPaneActiveKey: 'componentStore',
        // 组件面板是否展开
        componentPaneExpended: true,

        // 属性面板激活key
        propsPaneActiveKey: 'props',
        // 属性面板宽度
        propsPaneWidth: 400,
        // 属性面板是否展开
        propsPaneExpended: true,

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

        // 画布尺寸，指的是iframe尺寸
        canvasWidth: '100%',
        canvasHeight: '100%',
        canvasScale: 100,
        // 画布document节点
        canvasDocument: null,
        // 画布上渲染组件根节点
        canvasRenderRoot: null,

        // 渲染页面的配置
        pageConfig: rootNode(),

    },

    // 同步localStorage
    syncLocal: [
        'pageConfig',
        'viewMode',

        'componentPaneWidth',
        'componentPaneActiveKey',
        'componentPaneExpended',

        'propsPaneActiveKey',
        'propsPaneWidth',
        'propsPaneExpended',
    ],

    setFields: fields => ({ ...fields }),

    setDraggingNode: draggingNode => {
        if (!draggingNode) return { draggingNode: null };

        const { config } = draggingNode;

        const nodeConfig = getComponentConfig(config.componentName);
        const { propsToSet, isWrapper } = nodeConfig;

        let dropType;
        let dropTypeChangeable = true;
        if (propsToSet) dropType = 'props';
        if (isWrapper) {
            dropTypeChangeable = false;
            dropType = 'wrapper';
        }

        return {
            draggingNode: {
                id: config.id,
                type: 'new',
                config,
                propsToSet: cloneDeep(propsToSet),
                dropTypeChangeable,
                dropType: dropType,
            },
        };
    },

    // 组件另存为
    saveComponentAs(selectedNode) {
        // TODO
    },

    // 保存页面配置到服务端
    savePageConfig() {
        // TODO
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
     * @returns {{pageConfig}}
     */
    insertNode({ draggingNode, targetNode, targetHoverPosition }, state) {
        const { pageConfig } = state;
        const { config: draggingNodeConfig, dropType, propsToSet } = draggingNode;

        const parentNode = findParentNodeById(pageConfig, targetNode?.id);
        const nodeConfig = getComponentConfig(targetNode?.componentName);
        const parentNodeConfig = getComponentConfig(parentNode?.componentName);
        const {
            beforeAdd = () => undefined,
            afterAdd = () => undefined,
            beforeAddChildren = () => undefined,
            afterAddChildren = () => undefined,
        } = (nodeConfig?.hooks || {});

        const result = beforeAdd({ dragPageState: state, node: draggingNode, parentNode });
        if (result === false) return { pageConfig };

        const {
            beforeAddChildren: parentBeforeAddChildren = () => undefined,
            afterAddChildren: parentAfterAddChildren = () => undefined,
        } = (parentNodeConfig?.hooks || {});

        // 设置属性 state func node等都有可能
        if (dropType === 'props' && propsToSet) {
            if (!targetNode.props) targetNode.props = {};

            // 可能会有节点，尝试设置id
            setNodeId(propsToSet);

            Object.entries(propsToSet)
                .forEach(([key, value]) => {
                    targetNode.props[key] = value;
                });
            return {
                pageConfig: { ...pageConfig },
                selectedNode: null,
            };
        }

        if (dropType === 'wrapper') {
            // 移除拖动节点
            deleteNodeById(pageConfig, draggingNodeConfig?.id);

            if (!targetNode?.wrapper?.length) targetNode.wrapper = [];

            targetNode.wrapper.push(draggingNodeConfig);

            return {
                pageConfig: { ...pageConfig },
                selectedNode: draggingNodeConfig,
            };
        }

        if (dropType === 'replace') {
            // 保留wrapper
            draggingNodeConfig.wrapper = targetNode.wrapper;

            replaceNode(pageConfig, draggingNodeConfig, targetNode);

            return {
                pageConfig: { ...pageConfig },
                selectedNode: draggingNodeConfig,
            };
        }

        // 根节点为站位符时，直接替换
        if (pageConfig.componentName === 'DragHolder') {
            return { pageConfig: draggingNodeConfig };
        }
        const targetNodeId = targetNode.id;

        const isBefore = ['top', 'left'].includes(targetHoverPosition);
        const isAfter = ['right', 'bottom'].includes(targetHoverPosition);
        const isChildren = ['center'].includes(targetHoverPosition);

        if (isBefore || isAfter) {
            const args = { node: parentNode, childNode: draggingNodeConfig, dragPageState: state };
            const result = parentBeforeAddChildren(args);
            if (result === false) return { pageConfig };

            // 方法内部会做： 如果存在，先删除，相当于移动位置
            isBefore && insertBefore(pageConfig, draggingNodeConfig, targetNodeId);
            isAfter && insertAfter(pageConfig, draggingNodeConfig, targetNodeId);

            parentAfterAddChildren(args);
        }

        if (isChildren) {
            // 清除占位符
            if (targetNode?.children?.length === 1
                && targetNode.children[0].componentName === 'DragHolder'
            ) {
                targetNode.children = [];
            }

            const args = { node: targetNode, childNode: draggingNodeConfig, dragPageState: state };
            const result = beforeAddChildren(args);
            if (result === false) return { pageConfig };

            insertChildren(pageConfig, draggingNodeConfig, targetNode);

            afterAddChildren(args);
        }

        // 节点被拖拽出去之后，尝试给父级添加DragHolder
        addDragHolder(parentNode);

        afterAdd({ dragPageState: state, node: draggingNode, parentNode });

        return {
            pageConfig: { ...pageConfig },
            // 选中刚拖拽的节点
            selectedNode: draggingNodeConfig,
        };
    },
    /**
     * 根据id删除节点
     */
    deleteNodeById(id, state) {
        const { pageConfig } = state;
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

        const deleteResult = beforeDelete({ dragPageState: state, node: selectedNode, parentNode: parentNode });
        if (deleteResult === false) return null;

        const deleteChildrenResult = beforeDeleteChildren({ dragPageState: state, node: parentNode, childNode: selectedNode });
        if (deleteChildrenResult === false) return null;


        // 删除的是跟节点
        if (selectedNode.id === pageConfig.id) {
            return {
                pageConfig: rootNode(),
                selectedNode: null,
            };
        }

        const children = parentNode?.children || [];

        const deleteIndex = children.findIndex(item => item.id === selectedNode?.id);

        deleteNodeById(pageConfig, selectedNode?.id);

        afterDelete({ dragPageState: state, node: selectedNode, parentNode: parentNode });
        afterDeleteChildren({ dragPageState: state, node: parentNode, childNode: selectedNode });

        // 如果父节点中没有子节点，尝试添加占位符
        addDragHolder(parentNode);

        // 没有子节点了，选中父节点
        if (!children?.length) {
            return {
                pageConfig: { ...pageConfig },
                selectedNode: parentNode,
            };
        }
        // 选择下一个兄弟节点 或 上一个兄弟节点
        const nextNode = children[deleteIndex];
        const prevNode = children[deleteIndex - 1];

        return {
            pageConfig: { ...pageConfig },
            selectedNode: nextNode || prevNode,
        };
    },
};
