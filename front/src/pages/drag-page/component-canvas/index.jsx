import React from 'react';
import config from 'src/commons/config-hoc';
import IframeRender from './iframe-render';
import Scale from './scale';
import NodePath from './node-path';
import Tip from './tip';
import s from './style.less';

export default React.memo(config({})(function ComponentCanvas(props) {
    return (
        <div className={[s.root]}>
            <div className={s.iframeRender}>
                <IframeRender/>
                <Scale/>
            </div>
            <div className={s.bar}>
                <div className={s.nodePath}>
                    <NodePath/>
                </div>
                <div className={s.tip}>
                    <Tip/>
                </div>
            </div>
        </div>
    );
}));

