import React from 'react';
import s from './style.less';

export default function RootDragHolder(props) {
    const {
        className,
        ...others
    } = props;

    return (
        <div
            className={[s.root, className, 'RootDragHolder']}
            {...others}
        >
            <div className={s.tip}>请拖入组件</div>
        </div>
    );
};

