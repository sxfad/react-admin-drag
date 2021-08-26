import base from '../../base';
import common from '../common';
import dataShow from '../../data-show';

const pageContentConfig = base.find(item => item.subTitle === 'PageContent').children[0].config;
const queryBarConfig = common.find(item => item.subTitle === 'QueryBar').children[0].config;
const toolBarConfig = common.find(item => item.subTitle === 'ToolBar').children[0].config;
const tableConfig = dataShow.find(item => item.subTitle === 'Table').children[0].config;
const paginationConfig = common[2].children[0].config;


export default [
    {
        title: '常用页面',
        subTitle: 'Page',
        children: [
            {
                title: '列表页',
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
            {
                title: '两列表单',
                config: {
                    componentName: 'PageContent',
                    children: [
                        {
                            componentName: 'Text',
                            props: { text: 'TODO' },
                        },
                    ],
                },
            },
        ],
    },
];
