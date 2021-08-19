import React from 'react';
import s from './style.less';

export default React.forwardRef(function Container(props, ref) {
    const {className, children, ...others} = props;
    return (
        <div ref={ref} className={[s.root, className]} {...others}>
            {children}
        </div>
    );
});
