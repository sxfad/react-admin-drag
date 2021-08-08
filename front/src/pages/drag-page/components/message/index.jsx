import {useEffect} from 'react';
import {message} from 'antd';

export default function Message(props) {
    let {children, type, ...others} = props;
    if (!type) type = 'success';

    const id = children?.props?.config?.id;
    const nodeSelectType = children?.props?.nodeSelectType;
    const canvasDocument = children?.props?.canvasDocument;
    const dragPageAction = children?.props?.dragPageAction;
    const modalId = others['data-component-id'];

    function handleClick(e) {
        if (nodeSelectType === 'meta' && (e.metaKey || e.ctrlKey)) return;

        message[type]({
            getContainer: () => canvasDocument?.body,
            ...others,
        });

        // 不渲染，标题和内容无法编辑
        setTimeout(() => dragPageAction.render());
    }

    useEffect(() => {
        if (!canvasDocument) return;

        message.config({
            getContainer: () => canvasDocument?.body || document.body,
        });

    }, [canvasDocument]);


    useEffect(() => {
        if (id && canvasDocument) {
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
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, canvasDocument]);

    return children;
}
