import React from 'react';
import PropTypes from 'prop-types';
import s from './style.less';

const RectInputsWrapper = props => {
    const {children, inner, large, tip, ...others} = props;

    return (
        <div className={{
            [s.root]: true,
            [s.inner]: true,
            [s.large]: large,
            [s.tip]: tip
        }}
             {...others}
        >
            {children.flat().map(item => (<div key={item?.key} data-tip={tip}>{item}</div>))}
        </div>
    );
};

RectInputsWrapper.propTypes = {
    inner: PropTypes.bool,
    large: PropTypes.bool,
    tip: PropTypes.string,
};

RectInputsWrapper.defaultProps = {
    // large: true,
};

export default RectInputsWrapper;
