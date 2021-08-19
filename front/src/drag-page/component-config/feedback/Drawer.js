import { getFieldUUID } from 'src/drag-page/util';

export default {
    isContainer: true,
    editableContents: [
        {
            selector: '.ant-drawer-title',
            propsField: 'title',
        },
    ],

    // draggable: false,
    componentDisplayName: ({node}) => {
        const {componentName, props = {}} = node;
        const {title} = props;

        if (!title) return componentName;

        return `${componentName} ${title}`;
    },

    propsToSet: {
        onClick: 'func.handleShowDrawer',
    },
    hooks: {
        beforeAdd: options => {
            const {node, dragPageState: {pageConfig}} = options;
            if (!node.props) node.props = {};
            const uid = getFieldUUID();
            const field = `visible__${uid}`;
            const handleDrawerClose = `handleDrawerClose__${uid}`;
            const handleDrawerShow = `handleDrawerShow__${uid}`;
            node.__config = {
                pageState: {
                    [field]: false,
                },
                pageFunction: {
                    [handleDrawerShow]: `() => {setState({${field}: true})}`,
                    [handleDrawerClose]: `() => {setState({${field}: false})}`,
                },
            };

            node.props.visible = `state.${field}`;
            node.props.onClose = `func.${handleDrawerClose}`;
            node.propsToSet = {
                onClick: `func.${handleDrawerShow}`,
            };

            if (!pageConfig.children) pageConfig.children = [];
            pageConfig.children.push(node);
        },
    },
    fields: [
        {label: '显示关闭按钮', category: '选项', field: 'closable', type: 'boolean', defaultValue: true, version: '', desc: '是否显示右上角的关闭按钮'},
        {label: 'esc 关闭', category: '选项', field: 'keyboard', type: 'boolean', defaultValue: true, version: '', desc: '是否支持键盘 esc 关闭'},
        {label: '展示遮罩', category: '选项', field: 'mask', type: 'boolean', defaultValue: true, version: '', desc: '是否展示遮罩'},
        {label: '关闭图标', appendField: {closable: true}, field: 'closeIcon', type: 'ReactNode', version: '', desc: '自定义关闭图标'},
        {
            label: '标题', field: 'title',
            type: [
                {value: 'string', label: '字符串'},
                {value: 'ReactNode', label: '组件'},
            ],
            version: '', desc: '标题',
        },
        {
            label: '抽屉的方向',
            field: 'placement',
            type: 'radio-group',
            defaultValue: 'right',
            version: '',
            options: [
                {value: 'top', label: '上'},
                {value: 'right', label: '右'},
                {value: 'bottom', label: '下'},
                {value: 'left', label: '左'},
            ],
            desc: '抽屉的方向',
        },
        {label: '抽屉的页脚', field: 'footer', type: 'ReactNode', version: '', desc: '抽屉的页脚'},
        {label: '高度', appendField: {placement: ['top', 'bottom']}, field: 'height', type: 'unit', defaultValue: 256, version: '', desc: '高度, 在 placement 为 top 或 bottom 时使用'},
        {label: '宽度', field: 'width', type: 'unit', defaultValue: '256', version: '', desc: '宽度'},
        {label: '设置z-index', field: 'zIndex', type: 'number', defaultValue: '1000', version: '', desc: '设置 Drawer 的 z-index'},
    ],
};

/*
[
    {label:'切换抽屉时动画结束后的回调',field:'afterVisibleChange',type:'function(visible)',version:'',desc:'切换抽屉时动画结束后的回调'},
    {label:'可用于设置 Drawer 内容部分的样式',field:'bodyStyle',type:'CSSProperties',version:'',desc:'可用于设置 Drawer 内容部分的样式'},
    {label:'弹框外层容器的类名',field:'className',type:'string',version:'',desc:'弹框外层容器的类名'},
    {label:'是否显示右上角的关闭按钮',field:'closable',type:'boolean',defaultValue:true,version:'',desc:'是否显示右上角的关闭按钮'},
    {label:'自定义关闭图标',field:'closeIcon',type:'ReactNode',defaultValue:'<CloseOutlined />',version:'',desc:'自定义关闭图标'},
    {label:'可用于设置 Drawer 包裹内容部分的样式',field:'contentWrapperStyle',type:'CSSProperties',version:'',desc:'可用于设置 Drawer 包裹内容部分的样式'},
    {label:'关闭时销毁 Drawer 里的子元素',field:'destroyOnClose',type:'boolean',defaultValue:false,version:'',desc:'关闭时销毁 Drawer 里的子元素'},
    {label:'用于设置 Drawer 弹出层的样式',field:'drawerStyle',type:'CSSProperties',version:'',desc:'用于设置 Drawer 弹出层的样式'},
    {label:'抽屉的页脚',field:'footer',type:'ReactNode',version:'',desc:'抽屉的页脚'},
    {label:'抽屉页脚部件的样式',field:'footerStyle',type:'CSSProperties',version:'',desc:'抽屉页脚部件的样式'},
    {label:'预渲染 Drawer 内元素',field:'forceRender',type:'boolean',defaultValue:false,version:'',desc:'预渲染 Drawer 内元素'},
    {label:'指定 Drawer 挂载的 HTML 节点, false 为挂载在当前 dom',field:'getContainer',type:'radio-group',defaultValue:'body',version:'',options:[{value:'HTMLElement',label:'HTMLElement'},{value:'() => HTMLElement',label:'() => HTMLElement'},{value:'Selectors',label:'Selectors'},{value:'false',label:'false'}],desc:'指定 Drawer 挂载的 HTML 节点, false 为挂载在当前 dom'},
    {label:'用于设置 Drawer 头部的样式',field:'headerStyle',type:'CSSProperties',version:'',desc:'用于设置 Drawer 头部的样式'},
    {label:'高度, 在 placement 为 top 或 bottom 时使用',field:'height',type:'radio-group',defaultValue:'256',version:'',options:[{value:'string',label:'string'},{value:'number',label:'number'}],desc:'高度, 在 placement 为 top 或 bottom 时使用'},
    {label:'是否支持键盘 esc 关闭',field:'keyboard',type:'boolean',defaultValue:true,version:'',desc:'是否支持键盘 esc 关闭'},
    {label:'是否展示遮罩',field:'mask',type:'boolean',defaultValue:true,version:'',desc:'是否展示遮罩'},
    {label:'点击蒙层是否允许关闭',field:'maskClosable',type:'boolean',defaultValue:true,version:'',desc:'点击蒙层是否允许关闭'},
    {label:'遮罩样式',field:'maskStyle',type:'CSSProperties',defaultValue:'{}',version:'',desc:'遮罩样式'},
    {label:'抽屉的方向',field:'placement',type:'radio-group',defaultValue:'right',version:'',options:[{value:'top',label:'top'},{value:'right',label:'right'},{value:'bottom',label:'bottom'},{value:'left',label:'left'}],desc:'抽屉的方向'},
    {label:'用于设置多层 Drawer 的推动行为',field:'push',type:'radio-group',defaultValue:'{ distance: 180 }',version:'4.5.0+',options:[{value:'boolean',label:'boolean'},{value:'{ distance: string',label:'{ distance: string'},{value:'number }',label:'number }'}],desc:'用于设置多层 Drawer 的推动行为'},
    {label:'可用于设置 Drawer 最外层容器的样式，和 drawerStyle 的区别是作用节点包括 mask',field:'style',type:'CSSProperties',version:'',desc:'可用于设置 Drawer 最外层容器的样式，和 drawerStyle 的区别是作用节点包括 mask'},
    {label:'标题',field:'title',type:'ReactNode',version:'',desc:'标题'},
    {label:'Drawer 是否可见',field:'visible',type:'boolean',version:'',desc:'Drawer 是否可见'},
    {label:'宽度',field:'width',type:'radio-group',defaultValue:'256',version:'',options:[{value:'string',label:'string'},{value:'number',label:'number'}],desc:'宽度'},
    {label:'设置 Drawer 的 z-index',field:'zIndex',type:'number',defaultValue:'1000',version:'',desc:'设置 Drawer 的 z-index'},
    {label:'点击遮罩层或右上角叉或取消按钮的回调',field:'onClose',type:'function(e)',version:'',desc:'点击遮罩层或右上角叉或取消按钮的回调'}
]
* */
