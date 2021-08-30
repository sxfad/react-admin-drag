import * as antdIcon from '@ant-design/icons/lib/icons';

export default [
    {
        title: 'antd官方',
        subTitle: 'Icon',
        children: [
            ...(Object.keys(antdIcon)
                .filter((key, index) => {
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
