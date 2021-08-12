import React from 'react';
import config from 'src/commons/config-hoc';
import IframeRender from './iframe-render';
import s from './style.less';

export default React.memo(config({})(function ComponentCanvas(props) {

    return (
        <div className={[s.root]}>
            <IframeRender/>
        </div>
    );
}));

