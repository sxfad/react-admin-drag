import {useRef, useEffect} from 'react';
import {PageContent, useHeight} from '@ra-lib/admin';
import config from 'src/commons/config-hoc';
import Toolbar from 'src/pages/drag-page/toolbar';
import ComponentPane from 'src/pages/drag-page/component-pane';
import PropsPane from 'src/pages/drag-page/props-pane';
import ComponentCanvas from 'src/pages/drag-page/component-canvas';
import baseStore from 'src/pages/drag-page/component-category';
import s from './style.less';

export default config({
    path: '/drag-page',
    side: false,
    header: false,
    connect: true,
})(function(props) {

    const {
        action: {dragPage: dragPageAction},
    } = props;
    const mainRef = useRef(null);
    const [height] = useHeight(mainRef);

    useEffect(() => {
        // 设置组件库分类
        dragPageAction.setFields({
            stores: [
                {value: 'base', label: '基础组件库', dataSource: baseStore},
            ],
        });
    }, [dragPageAction]);

    return (
        <PageContent className={s.root}>
            <div className={s.top}>
                <Toolbar/>
            </div>
            <div ref={mainRef} className={s.main} style={{flex: `0 0 ${height}px`, height}}>
                <div className={s.left}>
                    <ComponentPane/>
                </div>
                <div className={s.center}>
                    <ComponentCanvas/>
                </div>
                <div className={s.right}>
                    <PropsPane/>
                </div>
            </div>
        </PageContent>
    );
});
