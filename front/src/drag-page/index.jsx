import {useRef, useEffect} from 'react';
import {useHeight} from '@ra-lib/admin';
import config from 'src/commons/config-hoc';
import Toolbar from 'src/drag-page/toolbar';
import ComponentPane from 'src/drag-page/component-pane';
import PropsPane from 'src/drag-page/props-pane';
import ComponentCanvas from 'src/drag-page/component-canvas';
import baseStore from 'src/drag-page/component-category';
// import baseStore2 from 'src/drag-page/component-category/index2';
import GlobalKeyMap from 'src/drag-page/global-key-map';
import UndoRedo from 'src/drag-page/undo-redo';
import s from './style.less';
import 'antd/dist/antd.less';
// 需要引入所有样式，否则有些组件通过node-render渲染无样式

export default config({
    connect: true,
})(function DragPage(props) {
    const {
        onSave, // 保存
        onSaveAs, // 另存为
        onSaveCode, // 保存源码
    } = props;

    const {
        action: {dragPage: dragPageAction},
    } = props;
    const mainRef = useRef(null);
    const [height] = useHeight(mainRef);

    useEffect(() => {
        // 设置组件库分类
        dragPageAction.setFields({
            stores: [
                ...baseStore,
            ],
        });
    }, [dragPageAction]);

    return (
        <div className={s.root}>
            <UndoRedo/>
            <GlobalKeyMap
                onSave={onSave}
                onSaveAs={onSaveAs}
            />
            <div className={s.top}>
                <Toolbar
                    onSave={onSave}
                    onSaveAs={onSaveAs}
                    onSaveCode={onSaveCode}
                />
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
        </div>
    );
});
