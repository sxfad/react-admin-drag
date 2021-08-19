import { useEffect } from 'react';
import { message } from 'antd';
import { getIdByElement } from 'src/drag-page/util';
import { store } from 'src/models';

export default function Message(props) {
    let { children, type, ...others } = props;
    if (!type) type = 'success';

    const id = children?.props?.config?.id;
    const { nodeSelectType, canvasDocument } = store.getState().dragPage;
    const modalId = getIdByElement(others);

    useEffect(() => {
        if (!canvasDocument) return;

        message.config({
            getContainer: () => canvasDocument?.body || document.body,
        });

    }, [canvasDocument]);


    useEffect(() => {
        if (!id || !canvasDocument) return;

        function handleClick(e) {
            if (nodeSelectType === 'meta' && (e.metaKey || e.ctrlKey)) return;

            message[type]({
                getContainer: () => canvasDocument?.body,
                ...others,
            });
        }

        const elements = canvasDocument.querySelectorAll(`.id_${id}`);
        if (elements?.length) {
            elements.forEach(element => {
                if (element.getAttribute(`data-message-id-${modalId}`) !== 'true') {
                    element.addEventListener('click', handleClick);
                    element.setAttribute(`data-message-id-${modalId}`, true);
                }
            });

            return () => {
                elements.forEach(element => {
                    element.removeEventListener('click', handleClick);
                    element.setAttribute(`data-message-id-${modalId}`, false);
                });
            };
        }
    }, [id, modalId, others, type, nodeSelectType, canvasDocument]);

    return children;
}
