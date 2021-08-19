import React from 'react';
import s from './style.less';

export default function DragHolder(props) {
    const {
        className,
        tip = '请拖入组件',
        ...others
    } = props;

    return (
        <div
            className={[s.root, className, DragHolder]}
            {...others}
        >
            {tip}
        </div>
    );
};

