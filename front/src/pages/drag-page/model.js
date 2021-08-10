import {v4 as uuid} from 'uuid';
import {
    deleteNodeById,
    findParentNodeById,
    insertAfter,
    insertBefore,
    insertChildren,
} from 'src/pages/drag-page/util/node-util';
import {addDragHolder} from 'src/pages/drag-page/util';
import {getComponentConfig} from 'src/pages/drag-page/component-config';

const testConfig = {
    id: uuid(),
    componentName: 'Form',
    props: {
        layout: 'inline',
        name: 'formName_6acde693-d28e-4f98-b725-018d5c40519f',
        onFinish: values => alert(JSON.stringify(values)),
    },
    children: [
        {
            id: uuid(),
            componentName: 'Form.Item',
            props: {
                label: '姓名',
                name: 'field1',
            },
            children: [
                {
                    id: uuid(),
                    componentName: 'Input',
                    props: {
                        placeholder: '请输入',
                    },
                },
            ],
        },
        {
            id: uuid(),
            componentName: 'Form.Item',
            props: {
                label: '年龄',
                name: 'field2',
            },
            children: [
                {
                    id: uuid(),
                    componentName: 'InputNumber',
                    props: {
                        style: {
                            width: '100%',
                        },
                        placeholder: '请输入',
                        min: 0,
                    },
                },
            ],
        },
        {
            id: uuid(),
            componentName: 'Form.Item',
            props: {
                label: '工作',
                name: 'field3',
            },
            children: [
                {
                    id: uuid(),
                    componentName: 'Select',
                    props: {
                        style: {
                            width: '100%',
                        },
                        placeholder: '请选择',
                        options: [
                            {
                                value: '1',
                                label: '选项1',
                            },
                            {
                                value: '2',
                                label: '选项2',
                            },
                        ],
                    },
                },
            ],
        },
        {
            id: uuid(),
            componentName: 'Form.Item',
            props: {
                label: '入职日期',
                name: 'field4',
            },
            children: [
                {
                    id: uuid(),
                    componentName: 'DatePicker',
                    props: {
                        style: {
                            width: '100%',
                        },
                        placeholder: '请选择日期',
                    },
                },
            ],
        },
        {
            id: uuid(),
            componentName: 'Form.Item',
            children: [
                {
                    id: uuid(),
                    componentName: 'Space',
                    children: [
                        {
                            id: uuid(),
                            componentName: 'Button',
                            props: {
                                type: 'primary',
                                htmlType: 'submit',
                            },
                            children: [
                                {
                                    id: uuid(),
                                    componentName: 'Text',
                                    props: {
                                        text: '提交',
                                        isDraggable: false,
                                    },
                                },
                            ],
                        },
                        {
                            id: uuid(),
                            componentName: 'Button',
                            children: [
                                {
                                    id: uuid(),
                                    componentName: 'Text',
                                    props: {
                                        text: '重置',
                                        isDraggable: false,
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};

// const rootHolderNode = () => ({id: uuid(), componentName: 'RootDragHolder'});
const rootHolderNode = () => ({
    id: uuid(),
    componentName: 'PageContent',
    children: [
        testConfig,
        {
            id: uuid(),
            componentName: 'Button',
            props: {
                type: 'primary',
            },
            children: [
                {id: uuid(), componentName: 'Text', props: {text: '按钮'}},
            ],
        },
        {
            id: uuid(),
            componentName: 'div',
            props: {
                style: {
                    width: 50,
                    height: 50,
                    background: 'red',
                },
            },
        },
    ],
});


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
        // 投放目标节点对应的dom元素
        targetElement: null,
        // 目标元素尺寸 top left width height
        targetElementSize: null,
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
        pageConfig: rootHolderNode(),

    },

    // 同步localStorage
    syncLocal: [
        'viewMode',

        'componentPaneWidth',
        'componentPaneActiveKey',
        'componentPaneExpended',

        'propsPaneActiveKey',
        'propsPaneWidth',
        'propsPaneExpended',
    ],

    setFields: fields => ({...fields}),

    // 根据节点id，删除节点
    deleteNodeById(node, state) {
        // TODO
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
     * 插入类型：
     *  before 在targetNode之前插入
     *  after 在targetNode之前插入
     *  children 作为 targetNode children
     *  props 作为 targetNode某个属性 快捷键 Alt
     *  wrapper 作为 target的wrapper，快捷键：Ctrl或meta 本质上渲染成target的父级，移动时随targetNode一起
     *  replace 替换targetNode 快捷键：Shift
     * @param _
     * @param state
     * @returns {{pageConfig}}
     */
    insertNode(_, state) {
        const {pageConfig, draggingNode, targetNode, targetHoverPosition} = state;
        const {config: draggingNodeConfig, type} = draggingNode;
        // 根节点为站位符时，直接替换
        if (pageConfig.componentName === 'DragHolder') {
            return {pageConfig: draggingNodeConfig};
        }

        const targetNodeId = targetNode.id;
        console.log(type);

        const isBefore = ['top', 'left'].includes(targetHoverPosition);
        const isAfter = ['right', 'bottom'].includes(targetHoverPosition);
        const isChildren = ['center'].includes(targetHoverPosition);

        if (isBefore) {
            // 方法内部会做： 如果存在，先删除，相当于移动位置
            insertBefore(pageConfig, draggingNodeConfig, targetNodeId);
        }

        if (isAfter) {
            insertAfter(pageConfig, draggingNodeConfig, targetNodeId);
        }

        if (isChildren) {
            // 清除占位符
            if (targetNode?.children?.length === 1
                && targetNode.children[0].componentName === 'DragHolder'
            ) {
                targetNode.children = [];
            }
            insertChildren(pageConfig, draggingNodeConfig, targetNode);
        }

        return {
            pageConfig: {...pageConfig},
        };
    },
    /**
     * 删除选中节点
     */
    deleteSelectedNode(_, state) {
        const {pageConfig, selectedNode} = state;
        if (!selectedNode) return;

        const nodeConfig = getComponentConfig(selectedNode?.componentName);
        const parentNode = findParentNodeById(pageConfig, selectedNode?.id);
        const parentNodeConfig = getComponentConfig(parentNode?.componentName);

        const {beforeDelete = () => undefined, afterDelete = () => undefined} = nodeConfig?.hooks || {};
        const {beforeDeleteChildren = () => undefined, afterDeleteChildren = () => undefined} = parentNodeConfig?.hooks || {};

        const deleteResult = beforeDelete({pageConfig, node: selectedNode, parentNode: parentNode});
        if (deleteResult === false) return;

        const deleteChildrenResult = beforeDeleteChildren({pageConfig, node: parentNode, childNode: selectedNode});
        if (deleteChildrenResult === false) return;


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

        afterDelete && afterDelete({pageConfig, node: selectedNode, parentNode: parentNode});
        afterDeleteChildren && afterDeleteChildren({pageConfig, node: parentNode, childNode: selectedNode});

        // 如果父节点中没有子节点，尝试添加占位符
        addDragHolder(parentNode);

        // 没有子节点了，选中父节点
        if (!children?.length) {
            return {
                pageConfig: {...pageConfig},
                selectedNode: parentNode,
            };
        }
        // 选择下一个兄弟节点 或 上一个兄弟节点
        const nextNode = children[deleteIndex];
        const prevNode = children[deleteIndex - 1];

        return {
            pageConfig: {...pageConfig},
            selectedNode: nextNode || prevNode,
        };
    },
};
