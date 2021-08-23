import {PageContent} from '@ra-lib/admin';
import config from 'src/commons/config-hoc';
import {Tabs} from 'antd';
import DragPage from './DragPage';
import Swagger from 'src/gen';

const {TabPane} = Tabs;

export default config({
    path: '/dev-ra-gen',
    side: false,
    header: false,
    auth: false,
})(function(props) {
        return (
            <PageContent style={{padding: 0, margin: 0}}>
                <Tabs type="card" tabBarStyle={{margin: 0}}>
                    <TabPane tab="页面编辑器" key="dragPage">
                        <DragPage/>
                    </TabPane>
                    <TabPane tab="模版生成CRUD" key="swagger">
                        <Swagger/>
                    </TabPane>
                </Tabs>
            </PageContent>
        );
    },
);
