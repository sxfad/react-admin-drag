export default {
    isContainer: false,
    draggable: true,
    isWrapper: true,
    hooks: {
        afterPropsChange: options => {
            const {node, dragPageAction} = options;
            if (node?.props?.visible === false) {
                setTimeout(() => {
                    Reflect.deleteProperty(node.props, 'visible');

                    dragPageAction.updateNode(node);
                });
            }
        },
    },
    fields: [
        {label: '显示', field: 'visible', type: 'boolean', version: '', desc: '提示信息'},
        {label: '卡片标题', field: 'title', type: 'string', version: '', desc: '提示信息'},
        {label: '卡片内容', field: 'content', type: 'ReactNode', version: '', desc: '提示信息'},
        {
            label: '触发方式', field: 'trigger', type: 'radio-group', defaultValue: 'hover',
            options: [
                {value: 'click', label: '点击'},
                {value: 'hover', label: '悬停'},
                {value: 'focus', label: '聚焦'},
            ],
            version: '', desc: '提示信息',
        },
        {label: '气泡框位置', field: 'placement', type: 'placement', defaultValue: 'top'},
    ],
};
