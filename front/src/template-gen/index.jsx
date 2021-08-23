import React, {useState} from 'react';
import {Tabs} from 'antd';
import {PageContent} from '@ra-lib/admin';
import Fast from './Fast';
import Single from './Single';
import s from './style.less';

const {TabPane} = Tabs;

export default function Gen() {
    const [activeKey, setActiveKey] = useState('single');

    return (
        <PageContent className={s.root}>
            <Tabs activeKey={activeKey} onChange={activeKey => setActiveKey(activeKey)}>
                <TabPane key="single" tab="单独生成">
                    {activeKey === 'single' ? <Single/> : null}
                </TabPane>
                <TabPane key="fast" tab="快速生成">
                    {activeKey === 'fast' ? <Fast/> : null}
                </TabPane>
            </Tabs>
        </PageContent>
    );
}
