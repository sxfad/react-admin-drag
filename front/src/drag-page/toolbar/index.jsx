import React, {useMemo, useEffect, useState} from 'react';
import {
    EyeOutlined,
    FormOutlined,
    SaveOutlined,
    DeleteOutlined,
    CloudServerOutlined,
    SwapLeftOutlined,
    SwapRightOutlined,
    QuestionCircleOutlined,
    EditOutlined,
} from '@ant-design/icons';
import {Tooltip} from 'antd';
import {Icon} from 'src/components';
import config from 'src/commons/config-hoc';
import {isMac} from 'src/drag-page/util';
import {Help} from 'src/drag-page/components';
import SourceCode from '../source-code';
import s from './style.less';

export default React.memo(config({
    connect: state => {
        return {
            viewMode: state.dragPage.viewMode,
            selectedNode: state.dragPage.selectedNode,
            contentEditable: state.dragPage.contentEditable,
        };
    },
})(function Toolbar(props) {
    const {
        viewMode,
        selectedNode,
        contentEditable,
        action: {dragPage: dragPageAction},
        onSave,
        onSaveAs,
        onSaveCode,
    } = props;

    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (viewMode === 'preview') {
            dragPageAction.setFields({
                componentPaneExpended: false,
                propsPaneExpended: false,
            });
        }
        if (viewMode === 'layout') {
            dragPageAction.setFields({
                componentPaneExpended: true,
                propsPaneExpended: true,
            });
        }
    }, [viewMode, dragPageAction]);

    const showLabel = false;
    const tools = useMemo(() => {
        return [
            viewMode === 'layout' ?
                {
                    key: 'contentEditable',
                    icon: <EditOutlined/>,
                    label: '直接编辑文字',
                    onClick: () => dragPageAction.setFields({contentEditable: !contentEditable}),
                } : null,
            {
                key: 'layout',
                icon: <FormOutlined/>,
                label: '布局模式',
                onClick: () => dragPageAction.setFields({viewMode: 'layout'}),
            },
            {
                key: 'preview',
                icon: <EyeOutlined/>,
                label: '预览模式',
                onClick: () => dragPageAction.setFields({viewMode: 'preview'}),
            },
            {
                key: 'divider',
            },
            {
                key: 'undo',
                icon: <SwapLeftOutlined/>,
                label: '上一步',
            },
            {
                key: 'redo',
                icon: <SwapRightOutlined/>,
                label: '下一步',
            },
            {
                key: 'divider',
            },
            {
                key: 'code',
                icon: <Icon type="icon-code"/>,
                label: '代码',
                onClick: () => dragPageAction.setFields({pageCodeVisible: true}),
            },
            {
                key: 'save',
                icon: <SaveOutlined/>,
                label: `保存(${isMac ? '⌘' : 'ctrl'}+s)`,
                onClick: () => onSave && onSave(),
            },
            {
                key: 'saveAs',
                icon: <CloudServerOutlined/>,
                label: '另存为',
                disabled: !selectedNode,
                onClick: () => onSaveAs && onSaveAs(selectedNode),
            },
            {
                key: 'delete',
                icon: <DeleteOutlined/>,
                label: `删除(${isMac ? '⌘' : 'ctrl'}+d)`,
                disabled: !selectedNode,
                onClick: () => dragPageAction.deleteNodeById(selectedNode?.id),
            },
            {
                key: 'divider',
            },
            {
                key: 'help',
                icon: <QuestionCircleOutlined/>,
                label: '帮助',
                onClick: () => setVisible(true),
            },
        ].filter(item => !!item);
    }, [dragPageAction, contentEditable, viewMode, selectedNode, onSave, onSaveAs]);
    return (
        <div className={s.root}>
            <div className={s.left}>
                {/*<Button onClick={() => props.history.goBack()}>返回</Button>*/}
            </div>
            <div className={s.center}>
                {tools.map((item, index) => {
                    let {key, icon, label, onClick, disabled} = item;

                    if (key === 'divider') {
                        return <div key={index} className={s.divider}/>;
                    }

                    const isActive = key === viewMode || (key === 'contentEditable' && contentEditable);

                    if (disabled) onClick = undefined;

                    const itemComponent = (
                        <div
                            key={key}
                            className={{
                                [s.toolItem]: true,
                                [s.active]: isActive,
                                [s.disabled]: disabled,
                                [s.showLabel]: showLabel,
                            }}
                            onClick={onClick}
                        >
                            <span className={s.icon}>{icon}</span>
                            {showLabel ? <span className={s.label}>{label}</span> : null}
                        </div>
                    );

                    if (showLabel) return itemComponent;
                    return (
                        <Tooltip key={key} title={label}>
                            {itemComponent}
                        </Tooltip>
                    );
                })}
            </div>
            <div className={s.right}/>
            <Help
                visible={visible}
                onCancel={() => setVisible(false)}
            />
            <SourceCode onSave={onSaveCode}/>
        </div>
    );
}));
