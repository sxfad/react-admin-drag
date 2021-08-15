import React, { useRef, useCallback } from 'react';
import { Tabs, Tooltip, Empty } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useHeight } from '@ra-lib/admin';
import config from 'src/commons/config-hoc';
import { Icon } from 'src/components';
import { isNode } from 'src/pages/drag-page/util/node-util';
import DragBar from '../drag-bar';
import Style from './style';
import s from './style.less';

const { TabPane } = Tabs;

const panes = [
    {
        key: 'style',
        title: '样式',
        icon: <Icon type="icon-style" />,
        component: Style,
    },
    {
        key: 'props',
        title: '属性',
        icon: <Icon type="icon-props" />,
        component: () => '属性',
    },
    {
        key: 'action',
        title: '事件',
        icon: <Icon type="icon-click" />,
        component: () => '事件',
    },
    {
        key: 'dataSource',
        title: '数据',
        icon: <Icon type="icon-data" />,
        component: () => '数据',
    },
    {
        key: 'comment',
        title: '注释',
        icon: <Icon type="icon-comment" />,
        component: () => '注释',
    },
];

export default React.memo(config({
    connect: state => {
        return {
            propsPaneActiveKey: state.dragPage.propsPaneActiveKey,
            propsPaneWidth: state.dragPage.propsPaneWidth,
            propsPaneExpended: state.dragPage.propsPaneExpended,
            selectedNode: state.dragPage.selectedNode,
        };
    },
})(function PropsPane(props) {
    const {
        propsPaneActiveKey,
        selectedNode,
        propsPaneWidth,
        propsPaneExpended,
        action: { dragPage: dragPageAction },
    } = props;

    const rootRef = useRef(null);

    const [height] = useHeight(rootRef);

    const handleChange = useCallback((key) => {
        dragPageAction.setFields({ propsPaneActiveKey: key });
    }, [dragPageAction]);

    const handleDragging = useCallback(info => {
        const { clientX } = info;
        const windowWidth = document.documentElement.clientWidth;
        const { x, width: rightWidth } = rootRef.current.getBoundingClientRect();

        const width = windowWidth - clientX - 4 - (windowWidth - x - rightWidth);

        dragPageAction.setFields({ propsPaneWidth: width });
    }, [dragPageAction]);

    const handleToggleClick = useCallback(() => {
        dragPageAction.setFields({ propsPaneExpended: !propsPaneExpended });
    }, [dragPageAction, propsPaneExpended]);

    return (
        <div
            ref={rootRef}
            className={{
                [s.root]: true,
                [s.expended]: propsPaneExpended,
            }}
            style={{ width: propsPaneExpended ? propsPaneWidth : 45 }}
        >
            <div className={s.toolBar}>
                <Tooltip
                    placement="right"
                    title={'展开'}
                    onClick={handleToggleClick}
                >
                    <div className={s.tool}>
                        <MenuFoldOutlined />
                    </div>
                </Tooltip>

                {panes.map(item => {
                    const { key, title, icon } = item;
                    const isActive = propsPaneActiveKey === key;

                    return (
                        <Tooltip
                            key={key}
                            placement="right"
                            title={title}
                            onClick={() => {
                                handleChange(key);
                                handleToggleClick();
                            }}
                        >
                            <div
                                key={key}
                                className={{ [s.tool]: true, [s.active]: isActive }}
                            >
                                {icon}
                            </div>
                        </Tooltip>
                    );
                })}
            </div>
            <div className={s.toolTabs}>
                <DragBar left onDragging={handleDragging} />
                <Tabs
                    tabBarExtraContent={{
                        left: (
                            <div className={s.toggle} onClick={handleToggleClick}>
                                <MenuUnfoldOutlined />
                            </div>
                        ),
                    }}
                    type="card"
                    tabBarStyle={{ marginBottom: 0 }}
                    activeKey={propsPaneActiveKey}
                    onChange={handleChange}
                >
                    {panes.map(item => {
                        const { key, title, icon, component: Component } = item;

                        return (
                            <TabPane tab={title} key={key}>
                                <div className={s.paneContainer} style={{ height: height - 40 }}>
                                    {selectedNode && isNode(selectedNode) ? (
                                        <Component title={title} icon={icon} />
                                    ) : (
                                        <Empty style={{ marginTop: 100 }} description="未选中节点" />
                                    )}
                                </div>
                            </TabPane>
                        );
                    })}
                </Tabs>
            </div>
        </div>
    );
}));
