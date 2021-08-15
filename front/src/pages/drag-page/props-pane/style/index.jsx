import React, {useState, useRef} from 'react';
import {Collapse, ConfigProvider, Tooltip} from 'antd';
import {useDebounceFn} from 'ahooks';
import {Icon} from 'src/components';
import config from 'src/commons/config-hoc';
import Layout from './layout';
import Font from './font';
import Position from './position';
// import Background from './background';
// import Border from './border';
import {StyleEditor} from 'src/pages/drag-page/components';
import {v4 as uuid} from 'uuid';
import {scrollElement, useRefreshByNode} from 'src/pages/drag-page/util';
import styles from './style.less';

const {Panel} = Collapse;

const options = [
    {key: 'layout', title: '布局', icon: <Icon type="icon-layout"/>, Component: Layout},
    {key: 'font', title: '文字', icon: <Icon type="icon-font"/>, Component: Font},
    {key: 'position', title: '定位', icon: <Icon type="icon-position"/>, Component: Position},
    // {key: 'background', title: '背景', icon: <Icon type="icon-background"/>, Component: Background},
    // {key: 'border', title: '边框', icon: <Icon type="icon-border"/>, Component: Border},
];

export default React.memo(config({
    connect: state => {
        return {
            selectedNode: state.dragPage.selectedNode,
            canvasDocument: state.dragPage.canvasDocument,
        };
    },
})(function ComponentStyle(props) {
    let {
        selectedNode,
        canvasDocument,
        height,
        action: {dragPage: dragPageAction},
    } = props;

    useRefreshByNode(selectedNode);

    const style = selectedNode?.props?.style || {};
    const componentId = selectedNode?.id;

    const [styleEditorVisible, setStyleEditorVisible] = useState(false);
    const [activeKey, setActiveKey] = useState(options.map(item => item.key));
    const boxRef = useRef(null);

    const {run: handleChange} = useDebounceFn((values, replace) => {
        if (!selectedNode?.componentName) return;

        if (!selectedNode?.props) selectedNode.props = {};

        if (!selectedNode.props.style) selectedNode.props.style = {};

        const style = selectedNode.props.style;

        if (replace) {
            // 直接替换，一般来自源码编辑器
            selectedNode.props.style = values;
        } else {
            // 合并
            selectedNode.props.style = {
                ...style,
                ...values,
            };
        }

        // 设置 key 每次保证渲染，都重新创建节点，否则属性无法被清空，样式为空，或者不合法，将不能覆盖已有样式 其他属性没有这样的问题
        // prefStyle: {backgroundColor: 'red'} nextStyle: {backgroundColor: 'red111'}, 样式依旧为红色
        selectedNode.props.key = uuid();

        dragPageAction.updateNode(selectedNode);

        console.log('selectedNode style', JSON.stringify(selectedNode.props.style, null, 4));
    }, {wait: 300});

    return (
        <ConfigProvider getPopupContainer={() => boxRef.current}>
            <StyleEditor
                value={style}
                onChange={values => handleChange(values, true)}
                visible={styleEditorVisible}
                onCancel={() => setStyleEditorVisible(false)}
            />
            <div className={styles.root}>
                <div className={styles.navigator}>
                    {options.map(item => {
                        const {key, title, icon} = item;
                        const id = `style-${key}`;

                        return (
                            <Tooltip key={key} placement="left" title={title}>
                                <div
                                    onClick={() => {
                                        setActiveKey(Array.from(new Set([key, ...activeKey])));
                                        const element = document.getElementById(id);
                                        scrollElement(boxRef.current, element, true, true, -12);
                                    }}
                                >
                                    {icon}
                                </div>
                            </Tooltip>
                        );
                    })}
                </div>

                <div
                    ref={boxRef}
                    className={styles.collapseBox}
                    id="styleCollapseBox"
                >
                    <Collapse
                        style={{border: 'none'}}
                        activeKey={activeKey}
                        onChange={activeKey => setActiveKey(activeKey)}
                    >
                        {options.map((item, index) => {
                            const {key, title, Component} = item;
                            const isLast = index === options.length - 1;

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
                </div>
            </div>
        </ConfigProvider>
    );
}));
