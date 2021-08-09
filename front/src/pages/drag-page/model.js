import {v4 as uuid} from 'uuid';

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
        }
    ],
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
        // 悬停目标节点的位置 top right bottom left center
        hoverTargetPosition: 'children',


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
};
