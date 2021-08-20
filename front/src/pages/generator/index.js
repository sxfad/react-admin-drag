import {PageContent} from '@ra-lib/admin';
import config from 'src/commons/config-hoc';
import DragPage from 'src/drag-page';
import {useCallback} from 'react';

export default config({
    path: '/ra-generator',
    side: false,
    header: false,
    auth: false,
    connect: state => {
        return {
            pageConfig: state.dragPage.pageConfig,
        };
    },
})(function(props) {
    const {pageConfig} = props;
    const handleSave = useCallback(() => {
        console.log('保存', pageConfig);

    }, [pageConfig]);
    const handleSaveAs = useCallback((selectedNode) => {
        console.log('另存为', selectedNode);
    }, []);
    const handleSaveCode = useCallback((code, errors) => {
        console.log('源码保存', code, errors);
    }, []);
    return (
        <PageContent style={{padding: 0, margin: 0}}>
            <DragPage
                onSave={handleSave}
                onSaveAs={handleSaveAs}
                onSaveCode={handleSaveCode}
            />
        </PageContent>
    );
});
