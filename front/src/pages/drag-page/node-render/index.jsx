import React, {createElement} from 'react';
import {getComponent, isFunctionString, getFieldOption} from 'src/pages/drag-page/util';
import {isNode} from 'src/pages/drag-page/util/node-util';
import {getComponentConfig} from 'src/pages/drag-page/component-config';
import {cloneDeep} from 'lodash';
import {store, actions} from 'src/models';
import styles from './style.less';

function getDragInfo(options) {
    const {config} = options;
    const {componentName, id} = config;
    const componentConfig = getComponentConfig(componentName);

    let {
        draggable,
    } = componentConfig;

    const dragProps = {
        draggable,
    };

    return {dragProps, dragClassName: `id_${id}`};
}

function getHookArgs(options) {
    const dragPageState = store.getState().dragPage;
    const dragPageAction = actions.dragPage;

    return {
        dragPageState,
        dragPageAction,
        ...options,
    };
}

// 遍历对象
const loop = (obj, cb) => {
    if (typeof obj !== 'object' || obj === null) return;

    if (Array.isArray(obj)) {
        obj.forEach(item => loop(item, cb));
    } else {
        Object.entries(obj)
            .forEach(([key, value]) => {
                if (typeof value === 'object' && !isNode(value)) {
                    loop(value, cb);
                } else {
                    cb(obj, key, value);
                }
            });
    }
};

export default React.memo(function NodeRender(props) {
    let {
        config,
        isPreview = true,
        state,
        ...others
    } = props;

    if (!config) return null;

    if (typeof config !== 'object' || Array.isArray(config)) return config;

    let {
        wrapper,
        componentName,
        children,
        props: componentProps,
    } = config;

    if (!componentName) return null;

    // 预览模式不显示DragHolder
    if (isPreview && componentName === 'DragHolder') return null;

    const componentConfig = getComponentConfig(componentName);

    let {
        render,
        actions = {},
        childrenDraggable,
        hooks = {},
        withDragProps,
    } = componentConfig;

    if (!componentProps.className) componentProps.className = '';

    config.props = componentProps;

    const isRender = hooks.beforeRender && hooks.beforeRender(getHookArgs({
        config,
        NodeRender,
        renderProps: props,
    }));

    if (isRender === false) return null;
    if (render === false) return null;

    const component = getComponent(config).component;

    loop(componentProps, (obj, key, value) => {
        // 属性中的state数据处理
        if (typeof value === 'string' && value.startsWith('state.')) {
            try {
                // eslint-disable-next-line
                obj[key] = eval(value);
            } catch (e) {
                console.error(e);
            }
        }

        const fieldOption = getFieldOption(config, key);

        // 字段是函数类型
        if (fieldOption?.functionType) {
            if (isNode(value)) {
                obj[key] = () => (
                    <NodeRender
                        key={value.id}
                        {..._props}
                        config={value}
                    />
                );
            } else {
                obj[key] = () => value;
            }
        }

        // 属性中的函数
        if (isFunctionString(value)) {
            let fn;
            try {
                // eslint-disable-next-line
                eval(`fn = ${value}`);

                if (typeof fn === 'function') {
                    obj[key] = fn;
                }
            } catch (e) {
                console.error(e);
            }
        }
    });

    const {dragClassName, dragProps} = getDragInfo({config});

    const _props = Object.entries(props).reduce((prev, curr) => {
        const [key, value] = curr;

        if (!Object.keys(others).includes(key)) {
            prev[key] = value;
        }

        return prev;
    }, {});

    // 处理属性中的节点
    Object.entries(componentProps)
        .filter(([, value]) => isNode(value) || (Array.isArray(value) && value.every(item => isNode(item))))
        .forEach(([key, value]) => {
            if (Array.isArray(value)) {
                componentProps[key] = value.map(item => {
                    return (
                        <NodeRender
                            key={item.id}
                            {..._props}
                            config={item}
                        />
                    );
                });
            } else {
                componentProps[key] = (
                    <NodeRender
                        key={value.id}
                        {..._props}
                        config={value}
                    />
                );
            }
        });

    // 处理子节点
    let childrenEle = children?.length ? children.map(item => {
        const childrenIsPreview = isPreview || !childrenDraggable;

        // 比较特殊，需要作为父级的直接子节点，不能使用 NodeRender
        if (['Tabs.TabPane', 'Breadcrumb.Item', 'Breadcrumb.Separator'].includes(item.componentName)) {
            const itemConfig = getComponentConfig(item.componentName);
            let {hooks = {}, withDragProps} = itemConfig;
            const {dragClassName, dragProps} = getDragInfo({config: item});
            const isRender = hooks.beforeRender && hooks.beforeRender(getHookArgs({config: item}));

            if (isRender === false) return null;

            if (hooks.afterRender) {
                setTimeout(() => {
                    hooks.afterRender(getHookArgs({
                        config: item,
                        dragProps: withDragProps ? dragProps : {},
                        dragClassName,
                        styles,
                        isPreview: childrenIsPreview,
                    }));
                });
            }

            const Component = getComponent(item).component;
            return (
                <Component {...dragProps} {...item.props}>

                    {item?.children?.map(it => {
                        return (
                            <NodeRender
                                key={it.id}
                                {..._props}
                                config={it}
                                isPreview={childrenIsPreview}
                            />
                        );
                    })}
                </Component>
            );
        }

        return (
            <NodeRender
                key={item.id}
                {..._props}
                config={item}
                isPreview={childrenIsPreview}
            />
        );
    }) : undefined;

    // Form.Item 会用到
    if (childrenEle?.length === 1) childrenEle = childrenEle[0];

    // 处理当前节点上的包装节点
    if (wrapper?.length) {
        wrapper = cloneDeep(wrapper);

        wrapper[0].children = [{...config, wrapper: null}];

        const nextConfig = wrapper.reduce((prev, wrapperConfig) => {
            wrapperConfig.children = [prev];

            return wrapperConfig;
        });

        return (
            <NodeRender
                key={nextConfig.id}
                {..._props}
                config={nextConfig}
            />
        );
    }

    // 组件配置中定义的事件
    const componentActions = Object.entries(actions)
        .reduce((prev, curr) => {
            const [key, value] = curr;
            prev[key] = (...args) => value(...args)(getHookArgs({
                config,
            }));
            return prev;
        }, {});
    const commonProps = {
        ...others,
        children: childrenEle,
        ...componentActions,
    };

    if (hooks.afterRender) {
        setTimeout(() => {
            hooks.afterRender(getHookArgs({
                config,
                dragProps,
                dragClassName,
                styles,
                isPreview,
            }));
        });
    }

    if (isPreview) {
        return createElement(component, {
            ...commonProps,
            ...componentProps,
            className: [dragClassName, componentProps.className].join(' '),
        });
    }
    /*
    if (withWrapper) {
        let {style = {}} = componentProps;
        const wStyle = {...wrapperStyle};

        style = {...style}; // 浅拷贝一份 有可能会修改

        // 同步到 wrapper 的样式
        const syncTopWStyle = [
            'display',
            'width',
            'height',
        ];

        // 移动到 wrapper上的样式
        const removeTopWStyle = [
            'marginTop',
            'marginRight',
            'marginBottom',
            'marginLeft',
        ];

        syncTopWStyle.forEach(key => {
            if (!(key in style)) return;

            wStyle[key] = style[key];
        });

        removeTopWStyle.forEach(key => {
            if (!(key in style)) return;

            wStyle[key] = style[key];
            style[key] = undefined;
        });

        return createElement('div', {
            ...dragProps,
            className: dragClassName + ' dragWrapper',
            style: wStyle,
            children: [
                createElement(component, {
                    ...commonProps,
                    ...componentProps,
                    style,
                }),
            ],
        });
    }
*/

    return createElement(component, {
        ...commonProps,
        ...componentProps,
        ...(withDragProps ? dragProps : {}),
        className: [dragClassName, componentProps.className].join(' '),
    });
});

