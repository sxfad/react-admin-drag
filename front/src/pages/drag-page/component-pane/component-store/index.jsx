import React, { useMemo, useState } from 'react';
import { Empty, Input, Select } from 'antd';
import { useDebounceFn } from 'ahooks';
import Container from '../container';
import Header from '../header';
import Content from '../content';
import config from 'src/commons/config-hoc';
import Category from './cagetory';
import Components from './components';
import s from './style.less';
import { filterTree } from 'src/pages/drag-page/util';

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
        action: { dragPage: dragPageAction },
    } = props;

    const [searchValue, setSearchValue] = useState('');

    const dataSource = useMemo(() => {
        if (!stores?.length) return [];

        const option = stores.find(item => item.value === selectedStoreId);

        const all = option?.dataSource || [];

        if (!searchValue) return all;

        return filterTree(
            option?.dataSource || [],
            node => {
                let { title = '', subTitle = '', config = {} } = node;
                let { componentName = '' } = config;

                title = title.toLowerCase();
                subTitle = subTitle.toLowerCase();
                componentName = componentName.toLowerCase();

                const val = searchValue ? searchValue.toLowerCase() : '';

                return title.includes(val)
                    || subTitle.includes(val)
                    || componentName.includes(val)
                    ;
            },
        );
    }, [stores, selectedStoreId, searchValue]);

    const storeOptions = useMemo(() => {
        if (!stores?.length) return [];

        return stores.map(item => ({ value: item.value, label: item.label }));

    }, [stores]);

    const { run: handleSearchChange } = useDebounceFn((e) => {
        setSearchValue(e.target.value);
    }, { wait: 300 });

    return (
        <Container>
            <Header icon={icon} title={title} />
            <div className={s.top}>
                <Input
                    allowClear
                    placeholder="请输入关键词搜索组件"
                    onChange={handleSearchChange}
                />
                <Select
                    style={{ width: '100%', marginTop: 4 }}
                    placeholder="选择组件分类"
                    options={storeOptions}
                    value={selectedStoreId}
                    onChange={selectedStoreId => dragPageAction.setFields({ selectedStoreId })}
                />
            </div>

            <Content>
                {!dataSource?.length ? (
                    <div className={[s.main, s.mainEmpty]}>
                        <Empty description="暂无组件" />
                    </div>
                ) : (
                    <div className={s.main}>
                        <Category dataSource={dataSource} selectedId={selectedSubCategoryId} />
                        <Components dataSource={dataSource} selectedId={selectedSubCategoryId} />
                    </div>
                )}
            </Content>
        </Container>
    );
});
