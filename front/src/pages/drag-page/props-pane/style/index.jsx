import React, {useState, useRef, useCallback, useMemo} from 'react';
import {Collapse, ConfigProvider, Tooltip} from 'antd';
import {useDebounceFn} from 'ahooks';
import {v4 as uuid} from 'uuid';
import {Icon} from 'src/components';
import config from 'src/commons/config-hoc';
import {StyleCodeEditor} from 'src/pages/drag-page/components';
import {scrollElement} from 'src/pages/drag-page/util';
import Layout from './layout';
import Font from './font';
import Position from './position';
import Background from './background';
import Border from './border';
import s from './style.less';

const {Panel} = Collapse;

// 所有属性面板配置
const panes = [
    {key: 'layout', title: '布局', icon: <Icon type="icon-layout"/>, Component: Layout},
    {key: 'font', title: '文字', icon: <Icon type="icon-font"/>, Component: Font},
    {key: 'position', title: '定位', icon: <Icon type="icon-position"/>, Component: Position},
    {key: 'background', title: '背景', icon: <Icon type="icon-background"/>, Component: Background},
    {key: 'border', title: '边框', icon: <Icon type="icon-border"/>, Component: Border},
];

export default React.memo(config({
    connect: state => {
        return {
            selectedNode: state.dragPage.selectedNode,
            canvasDocument: state.dragPage.canvasDocument,
            propsPaneWidth: state.dragPage.propsPaneWidth,
        };
    },
})(function ComponentStyle(props) {
    let {
        selectedNode,
        canvasDocument,
        height,
        codeVisible,
        onCodeCancel,
        propsPaneWidth,
        action: {dragPage: dragPageAction},
    } = props;

    const style = useMemo(() => {
        return selectedNode?.props?.style || {};
    }, [selectedNode]);

    const componentId = selectedNode?.id;
    const [activeKey, setActiveKey] = useState(panes.map(item => item.key));
    const boxRef = useRef(null);

    // 表单改变事件，更新selectedNode的style属性
    const {run: handleChange} = useDebounceFn((values, replace) => {
        if (!selectedNode?.props) selectedNode.props = {};
        if (!selectedNode.props.style) selectedNode.props.style = {};

        // 原style属性
        const prevStyle = selectedNode.props.style;

        // 直接替换，一般来自源码编辑器
        // 或 与原属性合并
        selectedNode.props.style = replace ? values : {
            ...prevStyle,
            ...values,
        };

        // 设置 key 每次保证渲染，都重新创建节点，否则属性无法被清空，样式为空，或者不合法，将不能覆盖已有样式 其他属性没有这样的问题
        // prefStyle: {backgroundColor: 'red'} nextStyle: {backgroundColor: 'red111'}, 样式依旧为红色
        selectedNode.props.key = uuid();

        dragPageAction.updateNode(selectedNode);
    }, {wait: 300});

    const handleNavClick = useCallback((key) => {
        // 设置手风琴展开
        setActiveKey(Array.from(new Set([key, ...activeKey])));

        // 使手风琴滚动到头部
        const id = `style-${key}`;
        const element = document.getElementById(id);
        scrollElement(boxRef.current, element, true, true, -12);
    }, [activeKey]);

    return (
        <ConfigProvider getPopupContainer={() => boxRef.current}>
            <div className={s.root}>
                {codeVisible ? (
                    <div className={s.code}>
                        <StyleCodeEditor
                            width={propsPaneWidth}
                            value={style}
                            onChange={values => handleChange(values, true)}
                            onCancel={onCodeCancel}
                        />
                    </div>
                ) : (
                    <>

                        {/* 左侧竖向导航按钮 */}
                        <div className={s.navigator}>
                            {panes.map(item => {
                                const {key, title, icon} = item;

                                return (
                                    <Tooltip key={key} placement="left" title={title}>
                                        <div onClick={() => handleNavClick(key)}>
                                            {icon}
                                        </div>
                                    </Tooltip>
                                );
                            })}
                        </div>

                        {/* 右侧面板 */}
                        <div ref={boxRef} className={s.collapseBox}>
                            <Collapse
                                style={{border: 'none'}}
                                activeKey={activeKey}
                                onChange={activeKey => setActiveKey(activeKey)}
                            >
                                {panes.map((item, index) => {
                                    const {key, title, Component} = item;

                                    // 最后一个面板，撑满父级容器
                                    const isLast = index === panes.length - 1;

                                    return (
                                        <Panel key={key} header={<span id={`style-${key}`}>{title}</span>}>
                                            <div style={isLast ? {height: height - 80} : null}>
                                                <Component
                                                    canvasDocument={canvasDocument}
                                                    componentId={componentId}
                                                    containerRef={boxRef}
                                                    value={style}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </Panel>
                                    );
                                })}
                            </Collapse>
                            {/* 最后一个面板如果没有展开，添加占位，滚动到底部时，使最后一个面变标题正好在最顶部 */}
                            {!activeKey.includes(panes[panes.length - 1].key) ? <div style={{height: height - 46}}/> : null}
                        </div>
                    </>
                )}
            </div>
        </ConfigProvider>
    );
}));
