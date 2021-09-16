import {v4 as uuid} from 'uuid';
import base from './base';
import navigation from './navigation';
import common from './common';
import form from './form';
import formItem from './form-item';
import dataInput from './data-input';
import dataShow from './data-show';
import feedback from './feedback';
import other from './other';
import icon from './icon';
import baseModule from './module';
import page from './page';


export default [
    {title: '常用页面', children: page},
    {title: '常用模块', children: baseModule},
    {title: '默认', children: base},
    {title: '通用', children: common},
    {title: '导航', children: navigation},
    {title: '表单', children: form},
    {title: '表单项', children: formItem},
    {title: '数据输入', children: dataInput},
    {title: '数据展示', children: dataShow},
    {title: '反馈', children: feedback},
    {title: '其他', children: other},
    {title: '图标', children: icon},
].map(item => {
    item.id = uuid();
    item.children = setDefaultConfig(item.children);

    return item;
});

function setDefaultConfig(subCategories) {
    const defaultConfig = {
        renderPreview: true, // 直接渲染 config配置
        previewProps: {}, // 预览时属性
    };

    if (!subCategories?.length) return subCategories;

    subCategories.forEach(subCategory => {
        if (!subCategory.id) subCategory.id = uuid();

        (subCategory?.children || []).forEach(node => {
            if (!node.id) node.id = uuid();

            Object.entries(defaultConfig)
                .forEach(([key, value]) => {
                    if (!(key in node)) node[key] = value;
                });

            // TODO 组件配置设置默认值
            // const {config} = node;

        });
    });

    return subCategories;
}

