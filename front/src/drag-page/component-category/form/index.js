import InlineFormImage from './InlineForm.png';
import FormImage from './Form.png';
import ColFormImage from './ColForm.jpg';

const formChildren = [
    {
        componentName: 'Form.Item',
        props: {
            label: '姓名',
            name: 'field1',
        },
        children: [
            {
                componentName: 'Input',
                props: {
                    placeholder: '请输入',
                },
            },
        ],
    },
    {
        componentName: 'Form.Item',
        props: {
            label: '年龄',
            name: 'field2',
        },
        children: [
            {
                componentName: 'InputNumber',
                props: {
                    style: {width: '100%'},
                    placeholder: '请输入',
                    min: 0,
                    step: 1,
                },
            },
        ],
    },
    {
        componentName: 'Form.Item',
        props: {
            label: '工作',
            name: 'field3',
        },
        children: [
            {
                componentName: 'Select',
                props: {
                    style: {width: '100%'},
                    placeholder: '请选择',
                    options: [
                        {value: '1', label: '选项1'},
                        {value: '2', label: '选项2'},
                    ],
                },
            },
        ],
    },
    {
        componentName: 'Form.Item',
        props: {
            label: '入职日期',
            name: 'field4',
        },
        children: [
            {
                componentName: 'DatePicker',
                props: {
                    style: {width: '100%'},
                    placeholder: '请选择日期',
                },
            },
        ],
    },
    {
        componentName: 'Form.Item',
        children: [
            {
                componentName: 'Space',
                children: [
                    {
                        componentName: 'Button',
                        props: {
                            type: 'primary',
                            htmlType: 'submit',
                        },
                        children: [
                            {
                                componentName: 'Text',
                                props: {text: '提交', isDraggable: false},
                            },
                        ],
                    },
                    {
                        componentName: 'Button',
                        props: {
                            htmlType: 'reset',
                        },
                        children: [
                            {
                                componentName: 'Text',
                                props: {text: '重置', isDraggable: false},
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

export default [
    {
        title: '表单',
        subTitle: 'Form',
        children: [
            {
                title: '表单容器',
                renderPreview: false,
                config: {
                    componentName: 'Form',
                    props: {
                        labelCol: {flex: '100px'},
                    },
                },
            },
            {
                title: '水平表单',
                image: InlineFormImage,
                previewHeight: 100,
                hidden: true,
                config: {
                    componentName: 'Form',
                    props: {
                        layout: 'inline',
                    },
                    children: formChildren,
                },
            },
            {
                title: '垂直表单',
                image: FormImage,
                config: {
                    componentName: 'Form',
                    props: {
                        labelCol: {flex: '100px'},
                    },
                    children: formChildren,
                },
            },
            {
                title: '多列表单',
                image: ColFormImage,
                config: {
                    componentName: 'Form',
                    props: {
                        labelCol: {flex: '100px'},
                    },
                    children: [
                        {
                            componentName: 'Row',
                            children: [
                                {
                                    componentName: 'Col',
                                    props: {
                                        span: 8,
                                    },
                                    children: [
                                        {
                                            componentName: 'Form.Item',
                                            props: {
                                                label: '姓名',
                                                name: 'field5',
                                            },
                                            children: [
                                                {
                                                    componentName: 'Input',
                                                    props: {
                                                        placeholder: '请输入',
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    componentName: 'Col',
                                    props: {
                                        span: 8,
                                    },
                                    children: [
                                        {
                                            componentName: 'Form.Item',
                                            props: {
                                                label: '年龄',
                                                name: 'field6',
                                            },
                                            children: [
                                                {
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
                                    ],
                                },
                                {
                                    componentName: 'Col',
                                    props: {
                                        span: 8,
                                    },
                                    children: [
                                        {
                                            componentName: 'Form.Item',
                                            props: {
                                                label: '工作',
                                                name: 'field7',
                                            },
                                            children: [
                                                {
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
                                    ],
                                },
                                {
                                    componentName: 'Col',
                                    props: {
                                        span: 8,
                                    },
                                    children: [
                                        {
                                            componentName: 'Form.Item',
                                            props: {
                                                label: '入职日期',
                                                name: 'field11',
                                            },
                                            children: [
                                                {
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
                                    ],
                                },
                                {
                                    componentName: 'Col',
                                    props: {
                                        span: 8,
                                    },
                                    children: [
                                        {
                                            componentName: 'Form.Item',
                                            props: {
                                                label: '工作',
                                                name: 'field9',
                                            },
                                            children: [
                                                {
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
                                    ],
                                },
                                {
                                    componentName: 'Col',
                                    props: {
                                        span: 8,
                                    },
                                    children: [
                                        {
                                            componentName: 'Form.Item',
                                            props: {
                                                label: '工作',
                                                name: 'field10',
                                            },
                                            children: [
                                                {
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
                                    ],
                                },
                                {
                                    componentName: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'center',
                                            width: '100%',
                                        },
                                    },
                                    children: [
                                        {
                                            componentName: 'Space',
                                            children: [
                                                {
                                                    componentName: 'Button',
                                                    props: {
                                                        type: 'primary',
                                                        htmlType: 'submit',
                                                    },
                                                    children: [
                                                        {
                                                            componentName: 'Text',
                                                            props: {text: '提交', isDraggable: false},
                                                        },
                                                    ],
                                                },
                                                {
                                                    componentName: 'Button',
                                                    props: {
                                                        htmlType: 'reset',
                                                    },
                                                    children: [
                                                        {
                                                            componentName: 'Text',
                                                            props: {text: '重置', isDraggable: false},
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            },
        ],
    },
];
