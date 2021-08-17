import {loopNode} from 'src/pages/drag-page/util/node-util';
import {deletePageFunctionField, deletePageStateField} from 'src/pages/drag-page/util';
// import {buttonTypeOptions} from '../options';

export default {
    editableContents: [
        {
            selector: '.ant-modal-title',
            propsField: 'title',
        },
        {
            selector: '.ant-modal-footer:not(.customer-modal-footer) .ant-btn-primary',
            propsField: 'okText',
        },
        {
            selector: '.ant-modal-footer:not(.customer-modal-footer) .ant-btn:not(.ant-btn-primary)',
            propsField: 'cancelText',
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
        onClick: 'func.handleShowModal',
    },
    hooks: {
        // 在modal添加到页面之前，准备好相关state、function等数据
        beforeAdd: options => {
            const {node, dragPageState: {pageConfig, pageState, pageFunction}} = options;
            if (!node.props) node.props = {};
            const id = Date.now();
            const field = `visible__${id}`;
            const handleCancel = `handleCancel__${id}`;
            const handleShowModal = `handleShowModal__${id}`;
            pageState[field] = true;
            pageFunction[handleCancel] = `() => setState({${field}: false})`;
            pageFunction[handleShowModal] = `() => setState({${field}: true})`;

            node.props.visible = `state.${field}`;
            node.props.onCancel = `func.${handleCancel}`;
            node.propsToSet = {
                onClick: `func.${handleShowModal}`,
            };

            if (!pageConfig.children) pageConfig.children = [];
            pageConfig.children.push(node);

            return {
                pageState: {...pageState},
                pageFunction: {...pageFunction},
            };
        },

        afterDelete: options => {
            const {node, dragPageState: {pageConfig, pageState, pageFunction}} = options;
            const {propsToSet, props} = node;

            // 弹框删除之后，清除关联节点的onClick属性
            if (propsToSet) {
                loopNode(pageConfig, node => {
                    const props = node.props || [];

                    Object.entries(propsToSet)
                        .forEach(([key, value]) => {
                            if (props[key] === value) Reflect.deleteProperty(props, key);
                            deletePageFunctionField(pageFunction, value);
                        });
                });
            }

            // 删除 pageState、pageFunction中相关数据
            deletePageStateField(pageState, props.visible);
            deletePageFunctionField(pageFunction, props.onCancel);

            return {
                pageState: {...pageState},
                pageFunction: {...pageFunction},
            };
        },
    },
    fields: [
        // {label: '显示弹框', field: 'visible', type: 'boolean', version: '', desc: '弹框是否可见'},
        {label: '弹框标题', field: 'title', type: 'string', version: '', desc: '标题'},
        {label: '弹框宽度', field: 'width', type: 'unit', defaultValue: 520, version: '', desc: '宽度'},
        {label: '遮罩', category: '选项', field: 'mask', type: 'boolean', defaultValue: true, version: '', desc: '是否展示遮罩'},
        {label: '遮罩可关闭', category: '选项', field: 'maskClosable', type: 'boolean', defaultValue: true, version: '', desc: '点击蒙层是否允许关闭'},
        {label: 'esc关闭', category: '选项', field: 'keyboard', type: 'boolean', defaultValue: true, version: '', desc: '是否支持键盘 esc 关闭'},
        {label: '垂直居中', category: '选项', field: 'centered', type: 'boolean', defaultValue: false, version: '', desc: '垂直居中展示 Modal'},
        {label: '展示默认底部', field: 'footer', type: 'FooterSwitch', version: '', desc: '底部内容，当不需要默认底部按钮时，可以设为 footer={null}'},
        {label: '确认按钮文字', field: 'okText', appendField: {footer: undefined}, type: 'string', defaultValue: '确定', version: '', desc: '确认按钮文字'},
        // {label: '确认按钮类型', field: 'okType', appendField: {footer: undefined}, type: 'radio-group', options: buttonTypeOptions, defaultValue: 'primary', version: '', desc: '确认按钮类型'},
        {label: '确定loading', field: 'confirmLoading', appendField: {footer: undefined}, type: 'boolean', defaultValue: false, version: '', desc: '确定按钮 loading'},
        {label: '取消按钮文字', field: 'cancelText', appendField: {footer: undefined}, type: 'string', defaultValue: '取消', version: '', desc: '取消按钮文字'},
        {label: 'z-index', field: 'zIndex', type: 'number', defaultValue: 1000, version: '', desc: '设置 Modal 的 z-index'},
        /*
        {label: 'Modal 完全关闭后的回调', field: 'afterClose', type: 'function', version: '', desc: 'Modal 完全关闭后的回调'},
        {label: 'Modal body 样式', field: 'bodyStyle', type: 'CSSProperties', defaultValue: '', version: '', desc: 'Modal body 样式'},
        {label: 'cancel 按钮 props', field: 'cancelButtonProps', type: 'ButtonProps', version: '', desc: 'cancel 按钮 props'},
        {label: '是否显示右上角的关闭按钮', field: 'closable', type: 'boolean', defaultValue: true, version: '', desc: '是否显示右上角的关闭按钮'},
        {label: '自定义关闭图标', field: 'closeIcon', type: 'ReactNode', defaultValue: '<CloseOutlined />', version: '', desc: '自定义关闭图标'},
        {label: '关闭时销毁 Modal 里的子元素', field: 'destroyOnClose', type: 'boolean', defaultValue: false, version: '', desc: '关闭时销毁 Modal 里的子元素'},
        {label: '弹框关闭后是否需要聚焦触发元素', field: 'focusTriggerAfterClose', type: 'boolean', defaultValue: true, version: '4.9.0', desc: '弹框关闭后是否需要聚焦触发元素'},

        {label: '强制渲染 Modal', field: 'forceRender', type: 'boolean', defaultValue: false, version: '', desc: '强制渲染 Modal'},
        {
            label: '指定 Modal 挂载的 HTML 节点, false 为挂载在当前 dom',
            field: 'getContainer',
            type: 'enum',
            defaultValue: 'document.body',
            version: '',
            options: [{value: 'HTMLElement', label: 'HTMLElement'}, {value: '() => HTMLElement', label: '() => HTMLElement'}, {value: 'Selectors', label: 'Selectors'}, {value: 'false', label: 'false'}],
            desc: '指定 Modal 挂载的 HTML 节点, false 为挂载在当前 dom',
        },


        {label: '遮罩样式', field: 'maskStyle', type: 'CSSProperties', defaultValue: '', version: '', desc: '遮罩样式'},
        {label: '自定义渲染弹框', field: 'modalRender', type: '(node: ReactNode) => ReactNode', version: '4.7.0', desc: '自定义渲染弹框'},
        {label: 'ok 按钮 props', field: 'okButtonProps', type: 'ButtonProps', version: '', desc: 'ok 按钮 props'},
        {label: '可用于设置浮层的样式，调整浮层位置等', field: 'style', type: 'CSSProperties', version: '', desc: '可用于设置浮层的样式，调整浮层位置等'},
        {label: '弹框外层容器的类名', field: 'wrapClassName', type: 'string', version: '', desc: '弹框外层容器的类名'},
        {label: '点击遮罩层或右上角叉或取消按钮的回调', field: 'onCancel', type: 'function(e)', version: '', desc: '点击遮罩层或右上角叉或取消按钮的回调'},
        {label: '点击确定回调', field: 'onOk', type: 'function(e)', version: '', desc: '点击确定回调'},
        */
    ],
};
