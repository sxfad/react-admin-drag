import React, {useEffect, useRef} from 'react';
import config from 'src/commons/config-hoc';
import s from './style.less';
import {scrollElement} from 'src/pages/drag-page/util';

export default config({
    connect: true,
})(function Components(props) {
    const {
        dataSource,
        selectedId,
        action: {dragPage: dragPageAction},
    } = props;

    const rootRef = useRef(null);

    // 选中分类，滚动到可见范围
    useEffect(() => {
        const element = document.getElementById(`componentSubCategory_${selectedId}`);
        scrollElement(rootRef.current, element, true);
    }, [selectedId]);

    return (
        <div className={s.root} ref={rootRef}>
            {dataSource.map((category, index) => {
                const {id: categoryId, children: subCategories = [], hidden} = category;

                if (hidden) return null;

                const isCategoryLast = index === dataSource.length - 1;

                return subCategories.map((subCategory, i) => {
                    const {id: subCategoryId, title, subTitle, children = [], hidden} = subCategory;
                    if (hidden) return null;

                    const isSubCategoryLast = isCategoryLast && (i === subCategories.length - 1);

                    return (
                        <div
                            key={categoryId + subCategoryId}
                            style={{height: isSubCategoryLast ? '100%' : 'auto'}}
                        >

                            <div
                                id={`componentSubCategory_${subCategoryId}`}
                                className={s.categoryTitle}
                            >
                                {title} {subTitle}
                            </div>
                            {children.map(item => {
                                const {id, title, hidden} = item;
                                if (hidden) return null;

                                return (
                                    <div
                                        key={id}
                                        id={`component_${id}`}
                                        onClick={() => dragPageAction.setFields({selectedSubCategoryId: subCategoryId})}
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
