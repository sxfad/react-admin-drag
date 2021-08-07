import React from 'react';
import s from './style.less';

export default React.memo(function ComponentCanvas(props) {

    return (
        <div className={s.root}>
            <div style={{ height: 1000, background: 'yellowgreen' }}>center</div>
        </div>
    );
});
