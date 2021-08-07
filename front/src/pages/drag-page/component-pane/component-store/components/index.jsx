import React, { useRef, useEffect, useMemo } from 'react';
import { useDebounceFn } from 'ahooks';
import { VariableSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import config from 'src/commons/config-hoc';
import Item from './Item';
import s from './style.less';

const Components = config({
    connect: state => {
        return {
            categoryScrollType: state.dragPage.categoryScrollType,
        };
    },
})(function Components(props) {
    const {
        dataSource,
        selectedId,
        categoryScrollType,
        action: { dragPage: dragPageAction },
    } = props;

    const rootRef = useRef(null);

    const items = useMemo(() => {
        const result = [];
        dataSource.forEach((category) => {
            const { id: categoryId, children: subCategories = [], hidden } = category;
            if (hidden) return;

            subCategories.forEach((subCategory) => {
                const { id: subCategoryId, title, subTitle, children = [], hidden } = subCategory;
                if (hidden) return;

                result.push({
                    id: subCategoryId,
                    categoryId,
                    subCategoryId,
                    title,
                    subTitle,
                    height: 30,
                    type: 'title',
                });

                children.forEach(item => {
                    const { hidden, renderPreview, previewHeight = 200 } = item;
                    if (hidden) return;

                    result.push({
                        ...item,
                        categoryId,
                        subCategoryId,
                        height: renderPreview ? previewHeight : 44,
                    });
                });
            });
        });
        return result;
    }, [dataSource]);

    // 滚动选中分类
    const { run: handleScroll } = useDebounceFn((info) => {
        const { visibleStartIndex, visibleStopIndex } = info;
        const index = categoryScrollType === 'byScroll' ? Math.floor((visibleStartIndex + visibleStopIndex) / 2) : visibleStartIndex;
        const { subCategoryId } = items[index];
        dragPageAction.setFields({ selectedSubCategoryId: subCategoryId, categoryScrollType: 'byScroll' });
    }, { wait: 300 });

    // 分类改变 滚动组件
    useEffect(() => {
        // 如果是当前组件列表自己滚动，则不触发
        if (categoryScrollType === 'byScroll') return;
        if (!rootRef.current) return;

        const index = items.findIndex(item => item.subCategoryId === selectedId);
        rootRef.current.scrollToItem(index, 'start');
    }, [selectedId, categoryScrollType, items]);

    // 数据源改变之后，滚动到第一个，一般是搜索，或者切换组件库引起的
    useEffect(() => {
        if (!rootRef.current) return;

        rootRef.current.scrollToItem(0, 'start');

        // 列表项样式缓存没有被清除导致行高一直和第一次可视区域里展示的一样
        rootRef.current.resetAfterIndex(0, true);
    }, [dataSource]);

    return (
        <AutoSizer>
            {({ height, width }) => (
                <VariableSizeList
                    height={height} // 列表可视区域的高度
                    itemCount={items.length} // 列表数据长度
                    itemSize={index => items[index].height} // 设置列表项的高度
                    layout="vertical" // （vertical/horizontal） 默认为vertical，此为设置列表的方向
                    width={width - 80}
                    ref={rootRef}
                    onItemsRendered={handleScroll}
                >
                    {({ index, style }) => {
                        const data = items[index];
                        const { type, subCategoryId, title, subTitle } = data;

                        if (type === 'title') {
                            return (
                                <div style={style}>
                                    <div
                                        id={`componentSubCategory_${subCategoryId}`}
                                        className={[s.categoryTitle, 'componentSubCategory']}
                                        title={title + subTitle}
                                    >
                                        {title} {subTitle}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div style={style}>
                                <Item data={data} />
                            </div>
                        );
                    }}
                </VariableSizeList>
            )}
        </AutoSizer>
    );
});

export default React.memo(Components);
