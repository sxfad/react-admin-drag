import { useEffect } from 'react';
import { notification } from 'antd';
import { store } from 'src/models';
import { getIdByElement } from 'src/drag-page/util';

export default function Notification(props) {
    let { children, type, ...others } = props;
    if (!type) type = 'success';

    const id = children?.props?.config?.id;
    const { nodeSelectType, canvasDocument } = store.getState().dragPage;
    const modalId = getIdByElement(others);

    useEffect(() => {
        if (!id || !canvasDocument) return;

        function handleClick(e) {
            if (nodeSelectType === 'meta' && (e.metaKey || e.ctrlKey)) return;
            notification[type]({
                getContainer: () => canvasDocument?.body,
                ...others,
            });
        }

        const elements = canvasDocument.querySelectorAll(`.id_${id}`);
        if (elements?.length) {
            elements.forEach(element => {
                if (element.getAttribute(`data-notification-id-${modalId}`) !== 'true') {
                    element.addEventListener('click', handleClick);
                    element.setAttribute(`data-notification-id-${modalId}`, true);
                }
            });

            return () => {
                elements.forEach(element => {
                    element.removeEventListener('click', handleClick);
                    element.setAttribute(`data-notification-id-${modalId}`, false);
                });
            };
        }
    }, [id, nodeSelectType, type, modalId, canvasDocument, others]);

    return children;
}
