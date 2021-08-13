import React, { useMemo, useEffect, useState } from 'react';
import {
    EyeOutlined,
    FormOutlined,
    SaveOutlined,
    DeleteOutlined,
    CloudServerOutlined,
    SwapLeftOutlined,
    SwapRightOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import { Icon } from 'src/components';
import config from 'src/commons/config-hoc';
import { isMac } from 'src/pages/drag-page/util';
import Help from '../help';
import s from './style.less';

export default React.memo(config({
    connect: state => {
        return {
            viewMode: state.dragPage.viewMode,
            selectedNode: state.dragPage.selectedNode,
        };
    },
})(function Toolbar(props) {
    const {
        viewMode,
        selectedNode,
        action: { dragPage: dragPageAction },
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
            {
                key: 'layout',
                icon: <FormOutlined />,
                label: '布局模式',
                onClick: () => dragPageAction.setFields({ viewMode: 'layout' }),
            },
            {
                key: 'preview',
                icon: <EyeOutlined />,
                label: '预览模式',
                onClick: () => dragPageAction.setFields({ viewMode: 'preview' }),
            },
            {
                key: 'divider',
            },
            {
                key: 'undo',
                icon: <SwapLeftOutlined />,
                label: '上一步',
            },
            {
                key: 'redo',
                icon: <SwapRightOutlined />,
                label: '下一步',
            },
            {
                key: 'divider',
            },
            {
                key: 'code',
                icon: <Icon type="icon-code" />,
                label: '代码',
                onClick: () => dragPageAction.setFields({ pageCodeVisible: true }),
            },
            {
                key: 'save',
                icon: <SaveOutlined />,
                label: `保存(${isMac ? '⌘' : 'ctrl'}+s)`,
                onClick: () => dragPageAction.savePageConfig(),
            },
            {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: `删除(${isMac ? '⌘' : 'ctrl'}+d)`,
                disabled: !selectedNode,
                onClick: () => dragPageAction.deleteNodeById(selectedNode?.id),
            },
            {
                key: 'saveAs',
                icon: <CloudServerOutlined />,
                label: '另存为',
                disabled: !selectedNode,
                onClick: () => dragPageAction.saveComponentAs(selectedNode),
            },
            {
                key: 'divider',
            },
            {
                key: 'help',
                icon: <QuestionCircleOutlined />,
                label: '帮助',
                onClick: () => setVisible(true),
            },
        ];
    }, [dragPageAction, selectedNode]);
    return (
        <div className={s.root}>
            <div className={s.left}>
                {/*<Button onClick={() => props.history.goBack()}>返回</Button>*/}
            </div>
            <div className={s.center}>
                {tools.map((item, index) => {
                    let { key, icon, label, onClick, disabled } = item;

                    if (key === 'divider') {
                        return <div key={index} className={s.divider} />;
                    }

                    const isActive = key === viewMode;

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
            <div className={s.right} />
            <Help
                visible={visible}
                onCancel={() => setVisible(false)}
            />
        </div>
    );
}));
