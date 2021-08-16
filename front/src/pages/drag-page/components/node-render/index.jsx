import React, {createElement, useCallback, useState} from 'react';
import {getComponent, useOnUpdateNodes} from 'src/pages/drag-page/util';
import {isNode} from 'src/pages/drag-page/util/node-util';
import {getComponentConfig} from 'src/pages/drag-page/component-config';
import {store, actions} from 'src/models';
import {cloneDeep} from 'lodash';
import s from './style.less';

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

const NodeRender = React.memo(function(renderNodeProps) {
    console.log('NodeRender');
    let {
        config,
        isPreview = true,
        pageRenderRoot,
        className,
        state,
        func,
        variable,
        ...others
    } = renderNodeProps;

    const dragPageAction = actions.dragPage;

    const [, setUpdate] = useState({});

    const callback = useCallback((data) => {
        const node = data.find(item => item.id === config?.id);
        if (node) {
            const {type} = node;
            setUpdate({type});
        }
    }, [config]);

    useOnUpdateNodes(callback);


    // 配置并不是组件节点，直接返回配置内容
    if (!isNode(config)) return config;

    // 预览模式不显示DragHolder
    if (isPreview && config.componentName === 'DragHolder') return null;

    let {
        id,
        key,
        wrapper,
        componentName,
        children,
    } = config;

    const componentConfig = getComponentConfig(componentName);

    let {
        draggable,
        childrenDraggable,
        render,
        hooks: {
            beforeRender,
            afterRender,
        } = {},
    } = componentConfig;

    if (render === false) return;

    const renderProps = {
        isPreview,
        pageRenderRoot,
        state,
        func,
        variable,
    };

    // hooks 可以得到的参数
    const hooksArgs = {
        node: config,
        NodeRender,
        renderProps,
        dragPageState: store.getState().dragPage,
        dragPageAction: actions.dragPage,
    };

    const isRender = beforeRender && beforeRender(hooksArgs);

    if (isRender === false) return null;

    setTimeout(() => {
        afterRender && afterRender(hooksArgs);

        const dragProps = {draggable};

        // 部分组件draggable属性没有设置到dom节点上，这里直接手动设置
        const ele = pageRenderRoot?.querySelector(`.id_${id}`);
        if (!ele) return;

        if (isPreview) {
            ele.classList.remove(s.draggable);
            Object.entries(dragProps).forEach(([key, value]) => {
                ele.removeAttribute(key);
            });
        } else {
            ele.classList.add(s.draggable);
            Object.entries(dragProps).forEach(([key, value]) => {
                ele.setAttribute(key, value);
            });
        }
    });

    // props setState 函数字符串中会用到
    const props = cloneDeep(config.props || {});
    // eslint-disable-next-line no-unused-vars
    const setState = dragPageAction.setPageState;

    console.log(config.componentName, config.id, props);
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
    loop(props, (obj, key, value) => {
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
        if (typeof value === 'string') {
            // props 是 pageState
            if (value.startsWith('state.')) {
                // eslint-disable-next-line no-eval
                obj[key] = eval(value);
            }
            // props 是 pageFunction
            if (value.startsWith('func.')) {
                // eslint-disable-next-line no-eval
                obj[key] = eval(eval(value));
            }
            // props 是 pageVariable
            if (value.startsWith('variable.')) {
                // eslint-disable-next-line no-eval
                obj[key] = eval(value);
            }
        }
    });

    const component = getComponent(config).component;

    let childrenEle = null;
    if (children?.length > 1) {
        childrenEle = children.map(childConfig => (
            <NodeRender
                key={childConfig.id}
                {...renderProps}
                isPreview={isPreview || childrenDraggable === false}
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
                isPreview={isPreview || childrenDraggable === false}
                config={childConfig}
            />
        );
    }

    // 组件样式，将组件id拼接到样式中，有些组件无法自定义属性，统一通过样式标记
    const cls = [props.className, `id_${id}`, className].filter(item => !!item).join(' ');

    return createElement(component, {
        key: key || id, // 如果节点设置了key，则使用key，否则使用id，key的改变会使组件卸载然后重新创建
        ...props,
        ...others,
        className: cls,
        children: childrenEle,
    });
});

// 可以去掉antd的子元素类型检查提醒
NodeRender.__ANT_BREADCRUMB_SEPARATOR = true;
NodeRender.__ANT_BREADCRUMB_ITEM = true;

export default NodeRender;
