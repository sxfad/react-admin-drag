import React from 'react';
import IframeRender from './iframe-render';
import s from './style.less';

export default React.memo(function ComponentCanvas(props) {

    return (
        <div className={s.root}>
            <div className={s.iframeRender}>
                <IframeRender/>
            </div>
        </div>
    );
});

