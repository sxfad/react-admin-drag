import React, {useMemo, useEffect, useState} from 'react';
import {
    EyeOutlined,
    FormOutlined,
    SaveOutlined,
    DeleteOutlined,
    CloudServerOutlined,
    UndoOutlined,
    RedoOutlined,
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
            pageConfigHistory: state.dragPage.pageConfigHistory,
            historyCursor: state.dragPage.historyCursor,
        };
    },
})(function Toolbar(props) {
    const {
        viewMode,
        selectedNode,
        contentEditable,
        pageConfigHistory,
        historyCursor,
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

        const disabledUndo = !pageConfigHistory?.length || historyCursor <= 0;
        const disabledRedo = !pageConfigHistory?.length || historyCursor >= pageConfigHistory?.length - 1;

        return [
            viewMode === 'layout' ?
                {
                    key: 'contentEditable',
                    icon: <EditOutlined/>,
                    label: '??????????????????',
                    onClick: () => dragPageAction.setFields({contentEditable: !contentEditable}),
                } : null,
            {
                key: 'layout',
                icon: <FormOutlined/>,
                label: '????????????',
                onClick: () => dragPageAction.setFields({viewMode: 'layout'}),
            },
            {
                key: 'preview',
                icon: <EyeOutlined/>,
                label: '????????????',
                onClick: () => dragPageAction.setFields({viewMode: 'preview'}),
            },
            {
                key: 'divider',
            },
            {
                key: 'undo',
                icon: <UndoOutlined/>,
                label: `??????(${isMac ? '???' : 'ctrl'}+z)`,
                disabled: disabledUndo,
                onClick: () => dragPageAction.undo(),
            },
            {
                key: 'redo',
                icon: <RedoOutlined/>,
                label: `??????(${isMac ? '???' : 'ctrl'}+shift+z)`,
                disabled: disabledRedo,
                onClick: () => dragPageAction.redo(),
            },
            {
                key: 'divider',
            },
            {
                key: 'code',
                icon: <Icon type="icon-code"/>,
                label: '??????',
                onClick: () => dragPageAction.setFields({pageCodeVisible: true}),
            },
            {
                key: 'save',
                icon: <SaveOutlined/>,
                label: `??????(${isMac ? '???' : 'ctrl'}+s)`,
                onClick: () => onSave && onSave(),
            },
            {
                key: 'saveAs',
                icon: <CloudServerOutlined/>,
                label: `?????????(${isMac ? '???' : 'ctrl'}+shift+s)`,
                disabled: !selectedNode,
                onClick: () => onSaveAs && onSaveAs(selectedNode),
            },
            {
                key: 'delete',
                icon: <DeleteOutlined/>,
                label: `??????(${isMac ? '???' : 'ctrl'}+d)`,
                disabled: !selectedNode,
                onClick: () => dragPageAction.deleteNodeById(selectedNode?.id),
            },
            {
                key: 'divider',
            },
            {
                key: 'help',
                icon: <QuestionCircleOutlined/>,
                label: '??????',
                onClick: () => setVisible(true),
            },
        ].filter(item => !!item);
    }, [
        dragPageAction,
        contentEditable,
        pageConfigHistory,
        historyCursor,
        viewMode,
        selectedNode,
        onSave,
        onSaveAs,
    ]);
    return (
        <div className={s.root}>
            <div className={s.left}>
                {/*<Button onClick={() => props.history.goBack()}>??????</Button>*/}
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
