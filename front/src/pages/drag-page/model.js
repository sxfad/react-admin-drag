import {v4 as uuid} from 'uuid';

// const rootHolderNode = () => ({id: uuid(), componentName: 'RootDragHolder'});
const rootHolderNode = () => ({
    id: uuid(),
    componentName: 'Button',
    props: {
        type: 'primary',
    },
    children: [
        {id: uuid(), componentName: 'Text', props: {text: '按钮'}},
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
