import React, { useRef } from 'react';
import { useDebounceFn } from 'ahooks';
import config from 'src/commons/config-hoc';
import s from './style.less';
import { isElementVisible } from 'src/pages/drag-page/util';

export default config({
    connect: true,
})(function Components(props) {
    const {
        dataSource,
        action: { dragPage: dragPageAction },
    } = props;

    const rootRef = useRef(null);

    // 滚动选中分类
    const { run: handleScroll } = useDebounceFn(() => {
        const allSubCategory = document.querySelectorAll('.componentSubCategory');
        for (const ele of Array.from(allSubCategory)) {
            const visible = isElementVisible(rootRef.current, ele);
            if (visible) {
                const subCategoryId = ele.id.replace('componentSubCategory_', '');
                dragPageAction.setFields({ selectedSubCategoryId: subCategoryId, categoryScrollForce: true });
                return;
            }
        }
    }, { wait: 300 });

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
