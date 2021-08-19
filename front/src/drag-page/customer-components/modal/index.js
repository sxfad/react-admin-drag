import { useEffect, useRef } from 'react';
import { Modal } from 'antd';
import { getIdByElement } from 'src/drag-page/util';
import { store } from 'src/models';

export default type => function ModalMethod(props) {
    const { children, ...others } = props;
    const id = children?.props?.config?.id;
    const { nodeSelectType, canvasDocument } = store.getState().dragPage;
    const modalRef = useRef(null);
    const modalId = getIdByElement(others);

    if (modalRef.current) {
        modalRef.current.update({
            ...others,
        });
    }

    useEffect(() => {
        if (!id || !canvasDocument) return;

        function handleClick(e) {
            if (nodeSelectType === 'meta' && (e.metaKey || e.ctrlKey)) return;

            modalRef.current = Modal[type]({
                getContainer: () => canvasDocument?.body,
                ...others,
            });
        }

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
    }, [id, modalId, nodeSelectType, others, canvasDocument]);

    return children;
}
