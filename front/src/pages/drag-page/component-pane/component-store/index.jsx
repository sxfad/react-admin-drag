import React, {useMemo} from 'react';
import {Empty, Input, Select} from 'antd';
import Container from '../container';
import Header from '../header';
import Content from '../content';
import config from 'src/commons/config-hoc';
import Category from './cagetory';
import Components from './components';
import s from './style.less';

export default config({
    connect: state => {
        return {
            stores: state.dragPage.stores,
            selectedStoreId: state.dragPage.selectedStoreId,
            selectedSubCategoryId: state.dragPage.selectedSubCategoryId,
        };
    },
})(function ComponentStore(props) {
    const {
        icon,
        title,
        stores,
        selectedStoreId,
        selectedSubCategoryId,
        action: {dragPage: dragPageAction},
    } = props;


    const dataSource = useMemo(() => {
        if (!stores?.length) return [];

        const option = stores.find(item => item.value === selectedStoreId);
        return option?.dataSource || [];
    }, [stores, selectedStoreId]);

    const storeOptions = useMemo(() => {
        if (!stores?.length) return [];

        return stores.map(item => ({value: item.value, label: item.label}));

    }, [stores]);


    return (
        <Container>
            <Header icon={icon} title={title}/>
            <div className={s.top}>
                <Input
                    allowClear
                    placeholder="请输入关键词搜索组件"
                />
                <Select
                    style={{width: '100%', marginTop: 4}}
                    placeholder="选择组件分类"
                    options={storeOptions}
                    value={selectedStoreId}
                    onChange={selectedStoreId => dragPageAction.setFields({selectedStoreId})}
                />
            </div>

            <Content>
                {!dataSource?.length ? (
                    <div className={[s.main, s.mainEmpty]}>
                        <Empty description="暂无组件"/>
                    </div>
                ) : (
                    <div className={s.main}>
                        <Category dataSource={dataSource} selectedId={selectedSubCategoryId}/>
                        <Components dataSource={dataSource} selectedId={selectedSubCategoryId}/>
                    </div>
                )}
            </Content>
        </Container>
    );
});
