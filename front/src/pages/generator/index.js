import { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import { PageContent } from '@ra-lib/admin';
import config from 'src/commons/config-hoc';
import TemplateGen from 'src/template-gen';
import DragPage from './DragPage';

const { TabPane } = Tabs;

export default config({
    path: '/dev-ra-gen',
    side: false,
    header: false,
    auth: false,
})(function(props) {
    const [activeKey, setActiveKey] = useState('dragPage');
    useEffect(() => {
        // 触发 window resize 事件，重新调整页面高度
        if (document.createEvent) {
            const ev = document.createEvent('HTMLEvents');
            ev.initEvent('resize', true, true);
            window.dispatchEvent(ev);
        } else if (document.createEventObject) {
            window.fireEvent('onresize');
        }
    }, [activeKey]);
    return (
        <PageContent style={{ padding: 0, margin: 0 }}>
            <Tabs
                type="card"
                tabBarStyle={{ margin: 0 }}
                activeKey={activeKey}
                onChange={activeKey => setActiveKey(activeKey)}
            >
                <TabPane tab="页面编辑器" key="dragPage">
                    <DragPage />
                </TabPane>
                <TabPane tab="模版生成CRUD" key="templateCrud">
                    <TemplateGen />
                </TabPane>
            </Tabs>
        </PageContent>
    );
});
