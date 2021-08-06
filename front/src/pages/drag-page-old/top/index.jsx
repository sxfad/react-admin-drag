import React from 'react';
import {
    EyeOutlined,
    FormOutlined,
    SaveOutlined,
    DeleteOutlined,
    CloudServerOutlined,
} from '@ant-design/icons';
import {Tooltip /*Button*/} from 'antd';
import FontIcon from 'src/pages/drag-page-old/font-icon';
import config from 'src/commons/config-hoc';
import {isMac} from '../util';
import Undo from '../undo';
import SourceCode from '../source-code';
import styles from './style.less';

export default config({
    router: true,
    connect: state => {

        return {
            activeToolKey: state.dragPageOld.activeToolKey,
            selectedNodeId: state.dragPageOld.selectedNodeId,
        };
    },
})(function Top(props) {
    const {
        activeToolKey,
        selectedNodeId,
        action: {dragPageOld: dragPageAction},
    } = props;
    const showLabel = true;
    const tools = [
        {
            key: 'layout',
            icon: <FormOutlined/>,
            label: '布局模式',
            onClick: () => dragPageAction.setActiveTookKey('layout'),
        },
        {
            key: 'preview',
            icon: <EyeOutlined/>,
            label: '预览模式',
            onClick: () => dragPageAction.setActiveTookKey('preview'),
        },
        'divider',
        {
            key: 'undo',
        },
        'divider',
        {
            key: 'code',
            icon: <FontIcon type="icon-code"/>,
            label: '代码',
            onClick: () => dragPageAction.showCode(true),
        },
        {
            key: 'save',
            icon: <SaveOutlined/>,
            label: `保存(${isMac ? '⌘' : 'ctrl'}+s)`,
            onClick: () => dragPageAction.save(),
        },
        {
            key: 'delete',
            icon: <DeleteOutlined/>,
            label: `删除(${isMac ? '⌘' : 'ctrl'}+d)`,
            disabled: !selectedNodeId,
            onClick: () => dragPageAction.deleteNodeById(selectedNodeId),
        },
        {
            key: 'saveAs',
            icon: <CloudServerOutlined/>,
            label: '另存为',
            disabled: !selectedNodeId,
            onClick: () => {
                // TODO
            },
        },
    ];
    return (
        <div className={styles.root}>
            <div className={styles.left}>
                {/*<Button onClick={() => props.history.goBack()}>返回</Button>*/}
            </div>
            <div className={styles.center}>
                {tools.map((item, index) => {
                    if (item === 'divider') {
                        return <div key={index} className={styles.divider}/>;
                    }

                    let {key, icon, label, onClick, disabled} = item;
                    if (key === 'undo') return <Undo key={key} showLabel={showLabel}/>;

                    const isActive = key === activeToolKey;

                    if (disabled) onClick = undefined;

                    const itemComponent = (
                        <div
                            key={key}
                            className={{
                                [styles.toolItem]: true,
                                [styles.active]: isActive,
                                [styles.disabled]: disabled,
                                [styles.showLabel]: showLabel,
                            }}
                            onClick={onClick}
                        >
                            <span className={styles.icon}>{icon}</span>
                            {showLabel ? <span className={styles.label}>{label}</span> : null}
                        </div>
                    );

                    if (showLabel) return itemComponent;
                    return (
                        <Tooltip key={key} title={label}>
                            {itemComponent}
                        </Tooltip>
                    );
                })}
                <SourceCode/>
            </div>
            <div className={styles.right}/>
        </div>
    );
});
