import {useEffect, useRef} from 'react';
import {Modal} from 'antd';

export default type => function ModalMethod(props) {
    const {children, ...others} = props;
    const id = children?.props?.config?.id;
    const nodeSelectType = children?.props?.nodeSelectType;
    const canvasDocument = children?.props?.canvasDocument;
    const dragPageAction = children?.props?.dragPageAction;
    const modalRef = useRef(null);

    const modalId = others['data-component-id'];

    function handleClick(e) {
        if (nodeSelectType === 'meta' && (e.metaKey || e.ctrlKey)) return;

        modalRef.current = Modal[type]({
            getContainer: () => canvasDocument?.body,
            ...others,
        });

        // 不渲染，标题和内容无法编辑
        setTimeout(() => dragPageAction.render());
    }

    if (modalRef.current) {
        modalRef.current.update({
            ...others,
        });
    }

    useEffect(() => {
        if (id && canvasDocument) {
            const elements = canvasDocument.querySelectorAll(`.id_${id}`);
            if (elements?.length) {
                elements.forEach(element => {
                    if (element.getAttribute(`data-modal-id-${modalId}`) !== 'true') {
                        element.addEventListener('click', handleClick);
                        element.setAttribute(`data-modal-id-${modalId}`, true);
                    }
                });

                return () => {
                    elements.forEach(element => {
                        element.removeEventListener('click', handleClick);
                        element.setAttribute(`data-modal-id-${modalId}`, false);
                    });
                };
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, canvasDocument]);

    return children;
}
