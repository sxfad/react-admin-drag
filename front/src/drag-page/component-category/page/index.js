import base from '../base';
import common from '../module/common';
import dataShow from '../data-show';

const pageContentConfig = base.find(item => item.subTitle === 'PageContent').children[0].config;
const queryBarConfig = common.find(item => item.subTitle === 'QueryBar').children[0].config;
const toolBarConfig = common.find(item => item.subTitle === 'ToolBar').children[0].config;
const tableConfig = dataShow.find(item => item.subTitle === 'Table').children[0].config;
const paginationConfig = common[2].children[0].config;


export default [
    {
        title: '列表页',
        subTitle: 'ListPage',
        children: [
            {
                title: '标准列表页',
                renderPreview: false,
                config: {
                    componentName: 'PageContent',
                    children: [
                        {
                            ...pageContentConfig,
                            children: [
                                queryBarConfig,
                                toolBarConfig,
                                tableConfig,
                                paginationConfig,
                            ],
                        },
                    ],
                },
            },
        ],
    },
];
