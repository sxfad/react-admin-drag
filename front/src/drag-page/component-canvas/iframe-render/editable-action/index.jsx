import {useCallback, useEffect} from 'react';
import {getComponentConfig} from 'src/drag-page/component-config';
import {debounce} from 'lodash';
import {v4 as uuid} from 'uuid';
import {/*isNode,*/ loopNode} from 'src/drag-page/util/node-util';
import {usePageConfigChange} from 'src/drag-page/util';
// import {getTextFromClipboard} from 'src/drag-page/util';

export default function EditableAction(props) {
    const {
        pageConfig,
        canvasDocument,
        dragPageAction,
    } = props;

    const pageConfigRefresh = usePageConfigChange();

    const loop = useCallback(cb => loopNode(pageConfig, node => {
        const className = `id_${node.id}`;
        const {editableContents} = getComponentConfig(node.componentName) || {};

        // 如果节点没有配置可编辑信息，直接返回
        if (!editableContents?.length) return;

        editableContents.forEach(item => {
            let {selector} = item;

            let elementsSelector = `.${className}`;
            if (typeof selector === 'function') {
                elementsSelector = selector({node, pageConfig});
            }
            if (typeof selector === 'string') {
                elementsSelector = `.${className} ${selector}`;
            }

            const elements = canvasDocument.querySelectorAll(elementsSelector);

            // 可编辑的dom元素不存在
            if (!elements?.length) return;

            Array.from(elements)
                // 过滤出有村文本节点的 dom 元素
                .filter(ele => Array.from(ele.childNodes).some(node => node.nodeType === Node.TEXT_NODE))
                .forEach((ele, index) => cb({elements, ele, index, node, item}));
        });
    }), [canvasDocument, pageConfig]);

    useEffect(() => {
        if (!canvasDocument) return;

        const actions = {};

        let tabIndex = 1000;
        loop(({elements, ele, index, node, item}) => {
            let {onInput, onBlur, onClick, propsField} = item;
            tabIndex++;

            let handleInput = () => undefined;

            if (propsField) {
                handleInput = (e) => {
                    // 多个，说明设置的是子节点
                    if (!node.props) node.props = {};
                    let props = node.props;
                    if (elements.length > 1 && node.children?.length) {
                        const childNode = node.children[index];
                        if (!childNode.props) childNode.props = {};
                        props = childNode.props;
                    }

                    if (!props[propsField] || typeof props[propsField] !== 'object') {
                        props[propsField] = e.target.innerText.trim();
                    }
                };
            }

            // 只能输入纯文本
            // ele.style.webkitUserModify = 'read-write-plaintext-only';

            ele.setAttribute('contenteditable', 'plaintext-only');
            ele.setAttribute('tabindex', tabIndex);
            // 清除 元素 focus 样式
            const prevOutline = window.getComputedStyle(ele).outline;
            const prevStyleOutline = ele.style.outline;

            const options = {index, node, pageConfig, dragPageAction, canvasDocument};

            function handleClick(e) {
                e.preventDefault();
                onClick && onClick(e)(options);
            }

            function handleFocus(e) {
                ele.style.outline = prevOutline;

                // 获取焦点之后，选中所有文本
                const iframe = document.getElementById('dnd-iframe');
                const contentWindow = iframe.contentWindow;

                if (canvasDocument.selection) {
                    const range = canvasDocument.body.createTextRange();
                    range.moveToElementText(e.target);
                    range.select();
                } else if (contentWindow.getSelection) {
                    const range = canvasDocument.createRange();
                    range.selectNodeContents(e.target);
                    contentWindow.getSelection().removeAllRanges();
                    contentWindow.getSelection().addRange(range);
                }
            }

            let changed = false;
            const handleInputDebounce = debounce(e => {
                if (onInput) {
                    onInput(e)(options);
                } else {
                    handleInput(e);
                }
                changed = true;
            }, 300);

            function handleBlur(e) {
                ele.style.outline = prevStyleOutline;
                if (onBlur) {
                    onBlur(e)(options);
                }

                // 失去焦点，如果有改变内容，触发渲染
                if (changed) {
                    dragPageAction.updateNode(node);
                    dragPageAction.refreshPropsPane(node);
                    changed = false;
                }
            }

            async function handleKeydown(e) {
                // const {key, metaKey, ctrlKey} = e;
                // const mc = metaKey || ctrlKey;
                // if (mc && key === 'v') {
                //     e.preventDefault();
                //     try {
                //         const text = await getTextFromClipboard();
                //         const cloneNode = JSON.parse(text);
                //         console.log(cloneNode);
                //         // 是节点
                //         if (isNode(cloneNode)) {
                //             e.preventDefault();
                //         }
                //     } catch (e) {
                //
                //     }
                // }
            }

            const eventMap = {
                click: handleClick,
                focus: handleFocus,
                input: handleInputDebounce,
                blur: handleBlur,
                keydown: handleKeydown,
            };

            Object.entries(eventMap)
                .forEach(([action, handler]) => {
                    ele.addEventListener(action, handler);
                });

            const actionKey = uuid();
            ele.setAttribute('data-actionKey', actionKey);

            actions[actionKey] = eventMap;
        });
        return () => {
            loop(({ele}) => {
                // ele.style.userModify = '';
                ele.removeAttribute('contenteditable');
                ele.removeAttribute('tabindex');
                const actionKey = ele.getAttribute('data-actionKey');

                const eventMap = actions[actionKey] || {};

                Object.entries(eventMap)
                    .forEach(([action, handler]) => {
                        ele.removeEventListener(action, handler);
                    });
            });
        };
    }, [pageConfig, pageConfigRefresh, canvasDocument, dragPageAction, loop]);

    return null;
}
