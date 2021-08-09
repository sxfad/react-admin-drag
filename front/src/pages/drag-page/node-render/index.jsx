import React, {createElement} from 'react';
import {getComponent} from 'src/pages/drag-page/util';
import {isNode} from 'src/pages/drag-page/util/node-util';
import {getComponentConfig} from 'src/pages/drag-page/component-config';
import {store, actions} from 'src/models';

// 遍历对象 基本类型以及节点属性
const loop = (obj, cb) => {
    if (typeof obj !== 'object' || obj === null) return;

    // entries 可以同时遍历对象和数组
    Object.entries(obj)
        .forEach(([key, value]) => {
            if (
                typeof value !== 'object'
                || isNode(value)
                || React.isValidElement(value)
            ) {
                return cb(obj, key, value);
            }

            loop(value, cb);
        });
};

const NodeRender = React.memo(function(props) {
    let {
        config,
        isPreview = true,
        canvasRenderRoot,
        className,
        ...others
    } = props;

    // 配置并不是组件节点，直接返回配置内容
    if (!isNode(config)) return config;

    // 预览模式不显示DragHolder
    if (isPreview && config.componentName === 'DragHolder') return null;

    let {
        id,
        wrapper,
        componentName,
        children,
        props: componentProps = {},
    } = config;

    const componentConfig = getComponentConfig(componentName);

    let {
        draggable,
        render,
        hooks: {
            beforeRender,
            afterRender,
        } = {},
    } = componentConfig;

    if (render === false) return;

    const renderProps = {
        isPreview,
        canvasRenderRoot,
    };

    // hooks 可以得到的参数
    const hooksArgs = {
        config,
        NodeRender,
        renderProps,
        dragPageState: store.getState().dragPage,
        dragPageAction: actions.dragPage,
    };

    const isRender = beforeRender && beforeRender(hooksArgs);

    if (isRender === false) return null;

    setTimeout(() => {
        afterRender && afterRender(hooksArgs);

        const dragProps = isPreview ? null : {draggable};
        if (!dragProps) return;
        // 部分组件draggable属性没有设置到dom节点上，这里直接手动设置
        const ele = canvasRenderRoot.querySelector(`.id_${id}`);
        if (!ele) return;

        Object.entries(dragProps).forEach(([key, value]) => {
            ele.setAttribute(key, value);
        });
    });

    // 存在 wrapper，进行wrapper转换为父元素
    if (wrapper?.length) {
        wrapper[0].children = [{...config, wrapper: null}];

        const nextConfig = wrapper.reduce((prev, curr) => {
            curr.children = [prev];

            return curr;
        });

        return (
            <NodeRender
                key={nextConfig.id}
                {...renderProps}
                config={nextConfig}
            />
        );
    }

    // props 属性处理，属性有可能是 节点 深层属性也有可能是节点
    loop(componentProps, (obj, key, value) => {
        // 是节点
        if (isNode(value)) {
            obj[key] = (
                <NodeRender
                    key={value.id}
                    {...renderProps}
                    config={value}
                />
            );
        }
        // TODO 是state
        // TODO 是函数
    });

    const component = getComponent(config).component;

    let childrenEle = null;
    if (children?.length > 1) {
        childrenEle = children.map(childConfig => (
            <NodeRender
                key={childConfig.id}
                {...renderProps}
                config={childConfig}
            />
        ));
    }

    if (children?.length === 1) {
        const childConfig = children[0];
        childrenEle = (
            <NodeRender
                key={childConfig.id}
                {...renderProps}
                config={childConfig}
            />
        );
    }

    // 组件样式，将组件id拼接到样式中，有些组件无法自定义属性，统一通过样式标记
    const cls = [componentProps.className, `id_${id}`, className].filter(item => !!item).join(' ');

    return createElement(component, {
        key: id,
        ...componentProps,
        ...others,
        className: cls,
        children: childrenEle,
    });
});

// 可以去掉antd的子元素类型检查提醒
NodeRender.__ANT_BREADCRUMB_SEPARATOR = true;
NodeRender.__ANT_BREADCRUMB_ITEM = true;

export default NodeRender;
