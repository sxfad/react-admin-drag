import from from '../../form';
import PaginationImage from './Pagination.jpg';

export default [
    {
        title: '查询条件',
        subTitle: 'QueryBar',
        children: [
            {
                title: '查询条件',
                image: from[0].children[1].image,
                previewHeight: 100,
                config: {
                    componentName: 'QueryBar',
                    children: [
                        from[0].children[1].config,
                    ],
                },
            },
        ],
    },
    {
        title: '工具条',
        subTitle: 'ToolBar',
        children: [
            {
                title: '工具条',
                renderPreview: true,
                previewZoom: .5,
                config: {
                    componentName: 'ToolBar',
                    children: [
                        {
                            componentName: 'Button',
                            props: {
                                type: 'primary',
                            },
                            children: [
                                {
                                    componentName: 'Text',
                                    props: {
                                        text: '添加',
                                        isDraggable: false,
                                    },
                                },
                            ],
                        },
                        {
                            componentName: 'Button',
                            props: {
                                type: 'primary',
                                danger: true,
                            },
                            children: [
                                {
                                    componentName: 'Text',
                                    props: {
                                        text: '批量删除',
                                        isDraggable: false,
                                    },
                                },
                            ],
                        },
                        {
                            componentName: 'Button',
                            props: {
                                type: 'default',
                            },
                            children: [
                                {
                                    componentName: 'Text',
                                    props: {
                                        text: '导出',
                                        isDraggable: false,
                                    },
                                },
                            ],
                        },
                    ],
                },
            },
        ],
    },
    {
        title: '分页',
        subTitle: 'Pagination',
        children: [
            {
                title: '分页',
                image: PaginationImage,
                config: {
                    componentName: 'Pagination',
                    props: {
                        total: 88,
                        pageNum: 1,
                        pageSize: 20,
                        onPageNumChange: pageNum => void 0,
                        onPageSizeChange: pageSize => void 0,
                    },
                },
            },
        ],
    },
    {
        title: '图片验证码',
        subTitle: 'ImageCode',
        children: [
            {
                title: '图片验证码',
                previewZoom: .7,
                previewProps: {
                    style: {
                        width: 220,
                    },
                },
                config: {
                    componentName: 'ImageCode',
                },
            },
        ],
    },
    {
        title: '短信验证码',
        subTitle: 'MessageCode',
        children: [
            {
                title: '短信验证码',
                previewZoom: .7,
                config: {
                    componentName: 'MessageCode',
                },
            },
        ],
    },
];
