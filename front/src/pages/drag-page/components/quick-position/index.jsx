import React from 'react';
import PropTypes from 'prop-types';
import {Icon} from 'src/components';
import {Tooltip} from 'antd';
import s from './style.less';

const quickPositionOptions = [
    {value: 'topLeft', icon: <Icon type="icon-layout-top-left"/>, label: '左上角'},
    {value: 'top', icon: <Icon type="icon-layout-top"/>, label: '上居中'},
    {value: 'topRight', icon: <Icon type="icon-layout-top-right"/>, label: '右上角'},
    {value: 'left', icon: <Icon type="icon-layout-left"/>, label: '左居中'},
    {value: 'center', placement: 'top', icon: <Icon type="icon-layout-center"/>, label: '居中'},
    {value: 'right', icon: <Icon type="icon-layout-right"/>, label: '右居中'},
    {value: 'bottomLeft', icon: <Icon type="icon-layout-bottom-left"/>, label: '左下角'},
    {value: 'bottom', icon: <Icon type="icon-layout-bottom"/>, label: '下居中'},
    {value: 'bottomRight', icon: <Icon type="icon-layout-bottom-right"/>, label: '右下角'},
];

function QuickPosition(props) {
    const {onClick, type, selectedKey} = props;
    const isLine = type === 'line';

    return (
        <div className={[s.root, s[type]]}>
            {quickPositionOptions.map(item => {
                const {value, placement, label, icon} = item;

                const sk = typeof selectedKey === 'function' ? selectedKey(item) : selectedKey;

                const isSelected = value === sk;

                return (
                    <Tooltip key={value} placement={isLine ? 'top' : placement || value} title={label}>
                        <div
                            className={s[isSelected]}
                            style={{cursor: 'pointer'}}
                            onClick={() => onClick(item)}
                        >
                            {icon}
                        </div>
                    </Tooltip>
                );
            })}
        </div>
    );
}

QuickPosition.propTypes = {
    type: PropTypes.string,
    onClick: PropTypes.func,
    selectedKey: PropTypes.any,
};

QuickPosition.defaultProps = {
    type: 'line',
    onClick: () => undefined,
};

export default QuickPosition;
