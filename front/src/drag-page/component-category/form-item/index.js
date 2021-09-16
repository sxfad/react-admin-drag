import formItems from './form-item';

export default [
    {
        title: '表单项',
        subTitle: 'Form.Item',
        children: [
            ...formItems,
            {
                title: '动态表单项',
                renderPreview: false,
                config: {
                    componentName: 'DynamicFormItem',
                },
            },
        ],
    },
];
