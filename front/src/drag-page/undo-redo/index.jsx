import {useEffect} from 'react';
import {useDebounceFn} from 'ahooks';
import config from 'src/commons/config-hoc';
import {usePageConfigChange} from 'src/drag-page/util';
// 触发记录的频率
const FREQUENCY = 1000;

export default config({
    connect: state => {

        return {
            pageConfig: state.dragPage.pageConfig,
            undoRedoFlag: state.dragPage.undoRedoFlag,
        };
    },
})(function UndoRedo(props) {
    const {
        pageConfig,
        undoRedoFlag,
        action: {dragPage: dragPageAction},
    } = props;

    const pageConfigRefresh = usePageConfigChange();

    const {run: handleAddHistory} = useDebounceFn((pageConfig) => {
        // 由于撤销重做触发，不做记录
        if (undoRedoFlag) {
            // 重新置空
            dragPageAction.setFields({undoRedoFlag: null});
            return;
        }
        dragPageAction.addPageConfigHistory(pageConfig);
    }, {wait: FREQUENCY});

    useEffect(() => {
        handleAddHistory(pageConfig);
    }, [
        handleAddHistory,
        pageConfigRefresh,
        pageConfig,
    ]);

    return null;
});
