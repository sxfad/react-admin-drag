import React, { useRef, useEffect } from 'react';
import { useThrottleFn } from 'ahooks';
import config from 'src/commons/config-hoc';
import s from './style.less';
import { isElementVisible, scrollElement } from 'src/pages/drag-page/util';

export default config({
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

    // 滚动选中分类
    const { run: handleScroll } = useThrottleFn(() => {
        const allSubCategory = document.querySelectorAll('.componentSubCategory');
        for (const ele of Array.from(allSubCategory)) {
            const visible = isElementVisible(rootRef.current, ele);
            if (visible) {
                const subCategoryId = ele.id.replace('componentSubCategory_', '');
                dragPageAction.setFields({ selectedSubCategoryId: subCategoryId, categoryScrollType: 'byScroll' });
                return;
            }
        }
    }, { wait: 500 });

    // 分类改变 滚动组件
    useEffect(() => {
        // 如果是当前组件列表自己滚动，则不触发
        if (categoryScrollType === 'byScroll') return;

        const element = document.getElementById(`componentSubCategory_${selectedId}`);
        scrollElement(rootRef.current, element, true, true);
    }, [selectedId, categoryScrollType]);


    return (
        <div className={s.root} ref={rootRef} onScroll={handleScroll}>
            {dataSource.map((category, index) => {
                const { id: categoryId, children: subCategories = [], hidden } = category;

                if (hidden) return null;

                const isCategoryLast = index === dataSource.length - 1;

                return subCategories.map((subCategory, i) => {
                    const { id: subCategoryId, title, subTitle, children = [], hidden } = subCategory;
                    if (hidden) return null;

                    const isSubCategoryLast = isCategoryLast && (i === subCategories.length - 1);

                    return (
                        <div
                            key={categoryId + subCategoryId}
                            style={{ height: isSubCategoryLast ? '100%' : 'auto' }}
                        >

                            <div
                                id={`componentSubCategory_${subCategoryId}`}
                                className={[s.categoryTitle, 'componentSubCategory']}
                                title={title + subTitle}
                            >
                                {title} {subTitle}
                            </div>
                            {children.map(item => {
                                const { id, title, hidden } = item;
                                if (hidden) return null;

                                return (
                                    <div
                                        key={id}
                                        id={`component_${id}`}
                                    >
                                        {title}
                                    </div>
                                );
                            })}
                        </div>
                    );
                });

            })}
        </div>
    );
});
