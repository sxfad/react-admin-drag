import {Descriptions} from 'antd';

export default {
    isContainer: true,
    dropAccept: 'Descriptions.Item',
    hooks: {
        renderChildren: ({node, NodeRender, renderProps}) => {
            const {children} = node;

            return children.map(item => {
                const {children: itemChildren, props} = item;

                return (
                    <Descriptions.Item {...props}>
                        {itemChildren.map(config => {
                            return (
                                <NodeRender
                                    key={config.id}
                                    {...renderProps}
                                    config={config}
                                />
                            );
                        })}
                    </Descriptions.Item>
                );
            });
        },
    },
    fields: [
        {
            label: '列表标题', field: 'title',
            type: [
                {value: 'string', label: '字符串'},
                {value: 'ReactNode', label: '组件'},

            ],
            version: '', desc: '描述列表的标题，显示在最顶部',
        },
        {
            label: '列数量',
            field: 'column',
            type: 'radio-group',
            version: '',
            defaultValue: 3,
            options: [
                {value: 2, label: '2列'},
                {value: 3, label: '3列'},
                {value: 4, label: '4列'},
                {value: 5, label: '5列'},
                {value: 6, label: '6列'},
            ],
            desc: '一行的 DescriptionItems 数量，可以写成像素值或支持响应式的对象写法 { xs: 8, sm: 16, md: 24}',
        },
        {label: '展示边框', category: '选项', field: 'bordered', type: 'boolean', defaultValue: false, version: '', desc: '是否展示边框'},
        {label: '展示冒号', category: '选项', field: 'colon', type: 'boolean', defaultValue: true, version: '', desc: '配置 Descriptions.Item 的 colon 的默认值'},
        // {label: '内容样式', field: 'contentStyle', type: 'CSSProperties', version: '4.10.0', desc: '自定义内容样式'},
        {
            label: '操作', field: 'extra',
            type: [
                {value: 'string', label: '字符串'},
                {value: 'ReactNode', label: '组件'},

            ],
            version: '4.5.0', desc: '描述列表的操作区域，显示在右上方',
        },
        {
            label: '描述布局', field: 'layout', type: 'radio-group', defaultValue: 'horizontal', version: '',
            options: [
                {value: 'horizontal', label: '水平'},
                {value: 'vertical', label: '垂直'},
            ],
            desc: '描述布局',
        },
        {
            label: '列表大小',
            field: 'size',
            type: 'radio-group',
            version: '',
            options: [
                {value: 'default', label: '默认'},
                {value: 'middle', label: '中号'},
                {value: 'small', label: '小号'},
            ],
            desc: '设置列表的大小。可以设置为 middle 、small, 或不填（只有设置 bordered={true} 生效）',
        },
    ],
};

/*
[
    {label:'是否展示边框',field:'bordered',type:'boolean',defaultValue:false,version:'',desc:'是否展示边框'},
    {label:'配置 Descriptions.Item 的 colon 的默认值',field:'colon',type:'boolean',defaultValue:true,version:'',desc:'配置 Descriptions.Item 的 colon 的默认值'},
    {label:'一行的 DescriptionItems 数量，可以写成像素值或支持响应式的对象写法 { xs: 8, sm: 16, md: 24}',field:'column',type:'number',defaultValue:'3',version:'',desc:'一行的 DescriptionItems 数量，可以写成像素值或支持响应式的对象写法 { xs: 8, sm: 16, md: 24}'},
    {label:'自定义内容样式',field:'contentStyle',type:'CSSProperties',version:'4.10.0',desc:'自定义内容样式'},
    {label:'描述列表的操作区域，显示在右上方',field:'extra',type:'ReactNode',version:'4.5.0',desc:'描述列表的操作区域，显示在右上方'},
    {label:'自定义标签样式',field:'labelStyle',type:'CSSProperties',version:'4.10.0',desc:'自定义标签样式'},
    {label:'描述布局',field:'layout',type:'radio-group',defaultValue:'horizontal',version:'',options:[{value:'horizontal',label:'horizontal'},{value:'vertical',label:'vertical'}],desc:'描述布局'},
    {label:'设置列表的大小。可以设置为 middle 、small, 或不填（只有设置 bordered={true} 生效）',field:'size',type:'radio-group',version:'',options:[{value:'default',label:'default'},{value:'middle',label:'middle'},{value:'small',label:'small'}],desc:'设置列表的大小。可以设置为 middle 、small, 或不填（只有设置 bordered={true} 生效）'},
    {label:'描述列表的标题，显示在最顶部',field:'title',type:'ReactNode',version:'',desc:'描述列表的标题，显示在最顶部'}
]
* */
