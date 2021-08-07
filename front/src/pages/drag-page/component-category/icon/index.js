import * as antdIcon from '@ant-design/icons/lib/icons';

export default [
    {
        title: 'antd官方',
        subTitle: 'Icon',
        children: [
            ...(Object.keys(antdIcon)
                .filter((key, index) => {
                    // TODO 如果图标全部加载，会导致 组件列表渲染卡顿
                    // return index < 2;
                    return /^[A-Z]/.test(key); // 首字母大写
                })
                .map(componentName => {
                    return {
                        title: componentName,
                        renderPreview: true,
                        previewProps: { style: { fontSize: 20 } },
                        previewHeight: 100,
                        icon: false,
                        config: {
                            componentName: componentName,
                        },
                    };
                })),
        ],
    },
];
