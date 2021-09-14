import React from 'react';
import {Form, Input} from 'antd';
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
                title: '水平表单',
                image: InlineFormImage,
                previewZoom: .7,
                config: {
                    componentName: 'Form',
                    props: {
                        layout: 'inline',
                        // name: 'inlineForm',
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
                        // name: 'form',
                    },
                    children: formChildren.map((item, index) => {
                        const isLast = formChildren.length - 1 === index;
                        const props = {...(item.props || {})};
                        if (isLast) {
                            props.style = {paddingLeft: '70px'};
                        } else {
                            props.labelCol = {flex: '70px'};
                        }

                        return {...item, props};
                    }),
                },
            },
            {
                title: '多列表单',
                image: ColFormImage,
                config: {
                    componentName: 'Form',
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
                                                labelCol: {
                                                    flex: '70px',
                                                },
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
                                                labelCol: {
                                                    flex: '70px',
                                                },
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
                                                labelCol: {
                                                    flex: '70px',
                                                },
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
                                                labelCol: {
                                                    flex: '70px',
                                                },
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
                                                labelCol: {
                                                    flex: '70px',
                                                },
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
                                                labelCol: {
                                                    flex: '70px',
                                                },
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
                            ],
                        },
                    ],
                },
            },
            {
                title: '表单项',
                renderPreview: (
                    <Form>
                        <Form.Item
                            label="名称"
                        >
                            <Input placeholder="请输入"/>
                        </Form.Item>
                    </Form>
                ),
                config: {
                    componentName: 'Form.Item',
                    props: {
                        label: '名称',
                        name: 'field',
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
            },
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
