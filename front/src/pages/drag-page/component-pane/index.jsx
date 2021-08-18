import React, { useRef, useCallback } from 'react';
import { Tooltip } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    AppstoreOutlined,
    SettingOutlined,
    ApartmentOutlined,
    BarsOutlined,
} from '@ant-design/icons';
import { Icon } from 'src/components';
import config from 'src/commons/config-hoc';
import { DragBar } from 'src/pages/drag-page/components';
import ComponentStore from 'src/pages/drag-page/component-pane/component-store';
import ComponentTree from 'src/pages/drag-page/component-pane/component-tree';
import ComponentMenu from 'src/pages/drag-page/component-pane/component-menu';
import ComponentSchema from 'src/pages/drag-page/component-pane/component-schema';
import ComponentSetting from 'src/pages/drag-page/component-pane/component-setting';
import s from './style.less';

export const panes = [
    {
        title: '页面菜单',
        key: 'menu',
        icon: <BarsOutlined style={{ fontSize: 20 }} />,
        Component: ComponentMenu,
    },
    {
        title: '组件树',
        key: 'componentTree',
        icon: <ApartmentOutlined />,
        Component: ComponentTree,
    },
    {
        title: '组件库',
        key: 'componentStore',
        icon: <AppstoreOutlined />,
        Component: ComponentStore,
    },
    {
        title: 'Schema 源码开发',
        key: 'schemaEditor',
        icon: <Icon type="icon-code" />,
        Component: ComponentSchema,
        bottom: true,
    },
    {
        title: '设置',
        key: 'setting',
        icon: <SettingOutlined />,
        Component: ComponentSetting,
        bottom: true,
    },
];

export default React.memo(config({
    connect: state => {
        return {
            componentPaneExpended: state.dragPage.componentPaneExpended,
            componentPaneWidth: state.dragPage.componentPaneWidth,
            componentPaneActiveKey: state.dragPage.componentPaneActiveKey,
        };
    },
})(function ComponentPane(props) {
    const {
        componentPaneExpended,
        componentPaneWidth,
        componentPaneActiveKey,
        action: { dragPage: dragPageAction },
    } = props;
    const rightRef = useRef(null);

    // 工具图标点击事件
    const handleToolClick = useCallback((key) => {
        dragPageAction.setFields({ componentPaneActiveKey: key });

        // 当前激活面板再次点击，进行展开收起操作
        if (key === componentPaneActiveKey) {
            dragPageAction.setFields({ componentPaneExpended: !componentPaneExpended });
            return;
        }
        dragPageAction.setFields({ componentPaneExpended: true });
    }, [dragPageAction, componentPaneActiveKey, componentPaneExpended]);

    // 展开收起
    const handleToggleCollapse = useCallback(() => {
        const nextComponentPaneExpended = !componentPaneExpended;

        // 展开时，默认显示组件库
        if (!nextComponentPaneExpended && !componentPaneActiveKey) {
            dragPageAction.setFields({ componentPaneActiveKey: 'componentStore' });
        }

        dragPageAction.setFields({ componentPaneExpended: nextComponentPaneExpended });
    }, [dragPageAction, componentPaneActiveKey, componentPaneExpended]);

    const handleDragging = useCallback((info) => {
        const { clientX } = info;

        const { x } = rightRef.current.getBoundingClientRect();
        dragPageAction.setFields({ componentPaneWidth: clientX - x - 4 });
    }, [dragPageAction]);

    const renderTools = useCallback((tools, bottom) => {
        return tools.filter(item => item.bottom === bottom).map(item => {
            const { title, key, icon } = item;
            const active = key === componentPaneActiveKey;

            return (
                <Tooltip key={key} placement="right" title={title}>
                    <div
                        className={[
                            s.toolItem,
                            { [s.active]: active },
                        ]}
                        onClick={() => handleToolClick(key)}
                    >
                        {icon}
                    </div>
                </Tooltip>
            );
        });
    }, [componentPaneActiveKey, handleToolClick]);

    const rightWidth = componentPaneExpended ? componentPaneWidth : 0;
    return (
        <div className={s.root}>
            {componentPaneExpended ? <DragBar onDragging={handleDragging} /> : null}
            <div className={s.left}>
                <div className={s.leftTop}>
                    <Tooltip placement="right" title={componentPaneExpended ? '收起' : '展开'}>
                        <div className={[s.toggle, s.toolItem]} onClick={() => handleToggleCollapse()}>
                            {componentPaneExpended ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                        </div>
                    </Tooltip>
                    {renderTools(panes)}
                </div>
                <div className={s.leftBottom}>
                    {renderTools(panes, true)}
                </div>
            </div>
            <div className={s.right} ref={rightRef} style={{ width: rightWidth }}>
                {componentPaneExpended && panes.map(item => {
                    const { key, title, icon, Component } = item;
                    const visible = key === componentPaneActiveKey;

                    // 除了tree、store 其他隐藏时不渲染，节省性能
                    if (!['componentTree', 'componentStore'].includes(key) && !visible) return null;

                    return (
                        <div
                            key={key}
                            id={key}
                            style={{
                                display: visible ? 'flex' : 'none',
                                height: '100%',
                                width: '100%',
                            }}
                        >
                            <Component
                                title={title}
                                icon={icon}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}));
