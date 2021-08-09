import React from 'react';
import c from 'classnames';
import s from './style.less';

function Text(props) {
    const {
        text,
        isDraggable,
        className,
        ...others
    } = props;

    return (
        <span
            className={c(
                isDraggable ? s.draggable : s.unDraggable,
                className,
            )}
            {...others}
        >
            {text}
        </span>
    );
}

Text.defaultProps = {
    isDraggable: true,
};
export default Text;

