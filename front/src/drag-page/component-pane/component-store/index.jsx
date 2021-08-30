import React, {useMemo, useState} from 'react';
import {Empty, Input} from 'antd';
import {useDebounceFn} from 'ahooks';
import Container from '../container';
import Header from '../header';
import Content from '../content';
import config from 'src/commons/config-hoc';
import Category from './cagetory';
import Components from './components';
import s from './style.less';
import {filterTree} from 'src/drag-page/util';
import DragDelegation from './drag-delegation';

const ComponentStore = config({
    connect: state => {
        return {
            stores: state.dragPage.stores,
            selectedSubCategoryId: state.dragPage.selectedSubCategoryId,
        };
    },
})(function ComponentStore(props) {
    const {
        icon,
        title,
        stores,
        selectedSubCategoryId,
    } = props;

    const [searchValue, setSearchValue] = useState('');

    const dataSource = useMemo(() => {
        if (!stores?.length) return [];

        // 所有大的分类中组件都显示到组件列表中，不区分最顶级分类
        // 原下拉选择分类去掉，所有组件查找通过查询
        const all = stores.map(item => item.children).flat();

        if (!searchValue) return all;

        return filterTree(
            all,
            node => {
                let {title = '', subTitle = '', config = {}} = node;
                let {componentName = ''} = config;

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
    }, [stores, searchValue]);

    const {run: handleSearchChange} = useDebounceFn((e) => {
        setSearchValue(e.target.value);
    }, {wait: 300});

    return (
        <Container>
            <Header icon={icon} title={title}/>
            <div className={s.top}>
                <Input
                    id="search-component"
                    allowClear
                    placeholder="请输入关键词搜索组件"
                    onChange={handleSearchChange}
                    autoComplete="off"
                />
            </div>

            <Content>
                {!dataSource?.length ? (
                    <div className={[s.main, s.mainEmpty]}>
                        <Empty description="暂无组件"/>
                    </div>
                ) : (
                    <DragDelegation className={s.main}>
                        <Category dataSource={dataSource} selectedId={selectedSubCategoryId}/>
                        <Components dataSource={dataSource} selectedId={selectedSubCategoryId}/>
                    </DragDelegation>
                )}
            </Content>
        </Container>
    );
});

export default React.memo(ComponentStore);

