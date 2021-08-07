import React from 'react';
import s from './style.less';

function Text(props) {
    const { text, isDraggable, ...others } = props;
    return (
        <span className={isDraggable ? s.draggable : s.unDraggable} {...others}>
            {text}
        </span>
    );
}

Text.defaultProps = {
    isDraggable: true,
};
export default Text;

