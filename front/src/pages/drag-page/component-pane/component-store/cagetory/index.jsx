import React, {useEffect, useRef} from 'react';
import config from 'src/commons/config-hoc';
import s from './style.less';
import {scrollElement} from 'src/pages/drag-page/util';

export default config({
    connect: true,
})(function Category(props) {
    const {
        selectedId,
        dataSource,
        action: {
            dragPage: dragPageAction,
        },
    } = props;

    const rootRef = useRef(null);

    // 选中分类，滚动到可见范围
    useEffect(() => {
        const element = document.getElementById(`subCategory_${selectedId}`);
        scrollElement(rootRef.current, element);
    }, [selectedId]);

    return (
        <div className={s.category} ref={rootRef}>
            {dataSource.map(category => {
                const {
                    id: categoryId,
                    title,
                    children = [],
                    hidden,
                } = category;

                if (hidden) return null;
                return (
                    <div key={categoryId} id={`category_${categoryId}`}>
                        {/* 一级分类标题 */}
                        <div className={s.categoryTitle}>{title}</div>

                        {/* 二级分类标题 */}
                        {children.map(subCategory => {
                            const {id: subCategoryId, title: subCategoryTitle, hidden, children = []} = subCategory;
                            if (hidden) return null;

                            const isActive = subCategoryId === selectedId;
                            let title = (
                                <div className={s.subCategoryTitle}>
                                    {subCategoryTitle}
                                </div>
                            );
                            const component = children[0];
                            if (component) {
                                // TODO 可拖拽
                                title = (
                                    <div>
                                        {title}
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={subCategoryId}
                                    id={`subCategory_${subCategoryId}`}
                                    className={[s.subCategory, {[s.active]: isActive}]}
                                    onClick={() => dragPageAction.setFields({selectedSubCategoryId: subCategoryId})}
                                >
                                    {title}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
});
