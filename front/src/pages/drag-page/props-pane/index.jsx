import React, { useRef } from 'react';
import { Tabs, Tooltip, Empty } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
import config from 'src/commons/config-hoc';
import { Icon } from 'src/components';
import { isNode } from 'src/pages/drag-page/util/node-util';
import DragBar from '../drag-bar';
import Style from './style';
import styles from './style.less';

const { TabPane } = Tabs;

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

    function handleChange(key) {
        dragPageAction.setFields({ propsPaneActiveKey: key });
    }

    const windowWidth = document.documentElement.clientWidth;

    function handleDragging(info) {
        const { clientX } = info;

        const { x, width: rightWidth } = rootRef.current.getBoundingClientRect();

        const width = windowWidth - clientX - 4 - (windowWidth - x - rightWidth);

        dragPageAction.setFields({ propsPaneWidth: width });
    }

    function handleToggleClick() {
        dragPageAction.setFields({ propsPaneExpended: !propsPaneExpended });
    }

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
            component: Style,
        },
        {
            key: 'action',
            title: '事件',
            icon: <Icon type="icon-click" />,
            component: Style,
        },
        {
            key: 'dataSource',
            title: '数据',
            icon: <Icon type="icon-data" />,
            component: Style,
        },
        {
            key: 'comment',
            title: '注释',
            icon: <Icon type="icon-comment" />,
            component: Style,
        },
    ];

    return (
        <div
            ref={rootRef}
            className={{
                [styles.root]: true,
                [styles.expended]: propsPaneExpended,
            }}
            style={{ width: propsPaneExpended ? propsPaneWidth : 45 }}
        >
            <div className={styles.toolBar}>
                <Tooltip
                    placement="right"
                    title={'展开'}
                    onClick={handleToggleClick}
                >
                    <div className={styles.tool}>
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
                                className={{ [styles.tool]: true, [styles.active]: isActive }}
                            >
                                {icon}
                            </div>
                        </Tooltip>
                    );
                })}
            </div>
            <div className={styles.toolTabs}>
                <DragBar left onDragging={handleDragging} />
                <Tabs
                    tabBarExtraContent={{
                        left: (
                            <div className={styles.toggle} onClick={handleToggleClick}>
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
                                {selectedNode && isNode(selectedNode) ? (
                                    <Component title={title} icon={icon} />
                                ) : (
                                    <Empty style={{ marginTop: 100 }} description="未选中节点" />
                                )}
                            </TabPane>
                        );
                    })}
                </Tabs>
            </div>
        </div>
    );
}));
