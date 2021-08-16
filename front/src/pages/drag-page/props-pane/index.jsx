import React, {useRef, useCallback, useState} from 'react';
import {Tabs, Tooltip, Empty} from 'antd';
import {MenuFoldOutlined, MenuUnfoldOutlined} from '@ant-design/icons';
import {useHeight} from '@ra-lib/admin';
import config from 'src/commons/config-hoc';
import {Icon} from 'src/components';
import {isNode} from 'src/pages/drag-page/util/node-util';
import {useRefreshByNode} from 'src/pages/drag-page/util';
import {DragBar, SelectedNode} from 'src/pages/drag-page/components';
import Style from './style';
import Props from './props';
import s from './style.less';

const {TabPane} = Tabs;

const ComingSoon = () => {
    return (
        <div style={{marginTop: 100, textAlign: 'center'}}>
            敬请期待
        </div>
    );
};
// 所有可用面板配置
const panes = [
    {key: 'style', title: '样式', icon: <Icon type="icon-style"/>, Component: Style},
    {key: 'props', title: '属性', icon: <Icon type="icon-props"/>, Component: Props},
    {key: 'action', title: '事件', icon: <Icon type="icon-click"/>, Component: ComingSoon},
    {key: 'dataSource', title: '数据', icon: <Icon type="icon-data"/>, Component: ComingSoon},
    {key: 'comment', title: '注释', icon: <Icon type="icon-comment"/>, Component: ComingSoon},
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
        action: {dragPage: dragPageAction},
    } = props;

    // selectedNode 更新触发当前组件更新
    // selectedNode引用类型，其内部属性有可能更新
    useRefreshByNode(selectedNode);

    const rootRef = useRef(null);
    const [codeVisible, setCodeVisible] = useState(panes.reduce((prev, curr) => {
        const {key} = curr;
        prev[key] = false;
        return prev;
    }, {}));

    // 计算面板内容高度
    const [height] = useHeight(rootRef);
    const paneContainerHeight = height - 85;

    // tab切换改变事件
    const handleTabChange = useCallback((key) => {
        dragPageAction.setFields({propsPaneActiveKey: key});
    }, [dragPageAction]);

    // DragBar 拖拽改变宽度事件
    const handleDragging = useCallback(info => {
        const {clientX} = info;
        const windowWidth = document.documentElement.clientWidth;
        const {x, width: rightWidth} = rootRef.current.getBoundingClientRect();
        const width = windowWidth - clientX - 4 - (windowWidth - x - rightWidth);

        dragPageAction.setFields({propsPaneWidth: width});
    }, [dragPageAction]);

    // 面板展开收起点击事件
    const handleToggleClick = useCallback(() => {
        dragPageAction.setFields({propsPaneExpended: !propsPaneExpended});
    }, [dragPageAction, propsPaneExpended]);

    // 源码编辑器图标点击事件
    const handleCodeIconClick = useCallback(() => {
        Object.entries(codeVisible)
            .forEach(([key, value]) => {
                if (key === propsPaneActiveKey) codeVisible[key] = !value;
            });
        setCodeVisible({...codeVisible});
    }, [propsPaneActiveKey, codeVisible]);

    return (
        <div
            ref={rootRef}
            className={[s.root, propsPaneExpended && s.expended]}
            style={{width: propsPaneExpended ? propsPaneWidth : 45}}
        >
            {/* 收起时 右侧竖向工具条 */}
            <div className={s.toolBar}>
                <Tooltip
                    placement="right"
                    title={'展开'}
                    onClick={handleToggleClick}
                >
                    <div className={s.tool}>
                        <MenuFoldOutlined/>
                    </div>
                </Tooltip>

                {panes.map(item => {
                    const {key, title, icon} = item;
                    const isActive = propsPaneActiveKey === key;

                    return (
                        <Tooltip
                            key={key}
                            placement="right"
                            title={title}
                            onClick={() => {
                                handleTabChange(key);
                                handleToggleClick();
                            }}
                        >
                            <div key={key} className={[s.tool, isActive && s.active]}>
                                {icon}
                            </div>
                        </Tooltip>
                    );
                })}
            </div>

            {/* Tab 页 */}
            <div className={s.toolTabs}>
                <DragBar left onDragging={handleDragging}/>
                <div className={s.paneTop}>
                    {selectedNode && isNode(selectedNode) ? (
                        <>
                            <SelectedNode node={selectedNode}/>
                            <Tooltip
                                title={() => {
                                    const pane = panes.find(item => item.key === propsPaneActiveKey);
                                    const {key, title} = pane;
                                    const visible = codeVisible[key];
                                    const tip = visible ? '关闭' : '打开';

                                    return `${tip}${title}源码编辑器`;
                                }}
                                placement="left"
                            >
                                <Icon
                                    type="icon-code"
                                    className={s.codeIcon}
                                    onClick={handleCodeIconClick}
                                />
                            </Tooltip>
                        </>
                    ) : '未选中节点'}
                </div>
                <Tabs
                    tabBarExtraContent={{
                        left: (
                            <div className={s.toggle} onClick={handleToggleClick}>
                                <MenuUnfoldOutlined/>
                            </div>
                        ),
                    }}
                    type="card"
                    tabBarStyle={{marginBottom: 0}}
                    activeKey={propsPaneActiveKey}
                    onChange={handleTabChange}
                >
                    {panes.map(item => {
                        const {key, title, Component} = item;

                        return (
                            <TabPane tab={title} key={key}>
                                <div className={s.paneRoot}>
                                    <div
                                        className={s.paneContainer}
                                        style={{
                                            height: paneContainerHeight,
                                            flexBasis: paneContainerHeight,
                                        }}
                                    >
                                        {selectedNode && isNode(selectedNode) ? (
                                            <Component
                                                height={paneContainerHeight}
                                                codeVisible={codeVisible[key]}
                                                onCodeCancel={() => setCodeVisible({...codeVisible, [key]: false})}
                                            />
                                        ) : (
                                            <Empty style={{marginTop: 100}} description="未选中节点"/>
                                        )}
                                    </div>
                                </div>
                            </TabPane>
                        );
                    })}
                </Tabs>
            </div>
        </div>
    );
}));
