import {PageContent} from '@ra-lib/admin';
import config from 'src/commons/config-hoc';
import DragPage from 'src/drag-page';

export default config({
    path: '/drag-page',
    side: false,
    header: false,
})(function(props) {
    return (
        <PageContent style={{padding: 0, margin: 0}}>
            <DragPage/>
        </PageContent>
    );
});
