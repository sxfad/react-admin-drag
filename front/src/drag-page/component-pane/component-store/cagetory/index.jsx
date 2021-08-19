import React, {useEffect, useRef} from 'react';
import {usePrevious} from 'ahooks';
import config from 'src/commons/config-hoc';
import s from './style.less';
import {scrollElement} from 'src/drag-page/util';

export default config({
    connect: state => {
        return {
            categoryScrollType: state.dragPage.categoryScrollType,
        };
    },
})(function Category(props) {
    const {
        selectedId,
        dataSource,
        categoryScrollType,
        action: {dragPage: dragPageAction},
    } = props;

    const previousCategoryScrollType = usePrevious(categoryScrollType);

    const rootRef = useRef(null);

    // 选中分类，滚动到可见范围
    useEffect(() => {
        // 点击分类，组件会滚动，组件滚动之后会改变 categoryScrollType ，导致 effect又按照 byScroll方式触发
        // 这里做个判断，防止点击分类后触发两次滚动
        if (previousCategoryScrollType === 'byClick' && categoryScrollType === 'byScroll') return;

        const element = document.getElementById(`subCategory_${selectedId}`);
        scrollElement(rootRef.current, element, false, categoryScrollType === 'byScroll');
    }, [selectedId, previousCategoryScrollType, categoryScrollType]);

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
                                title = (
                                    <div draggable data-config={JSON.stringify(component.config)}>
                                        {title}
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={subCategoryId}
                                    id={`subCategory_${subCategoryId}`}
                                    className={[s.subCategory, {[s.active]: isActive}]}
                                    onClick={() => dragPageAction.setFields({selectedSubCategoryId: subCategoryId, categoryScrollType: 'byClick'})}
                                    title={title}
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
