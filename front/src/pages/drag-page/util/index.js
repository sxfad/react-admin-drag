import {getComponentConfig} from 'src/pages/drag-page/component-config';
import {findNodesByName, findParentNodeByName, findNodeById, findParentNodeById} from 'src/pages/drag-page/util/node-util';
import * as raLibComponent from '@ra-lib/admin';
import * as components from 'src/pages/drag-page/components';
import * as antdComponent from 'antd/es';
import * as antdIcon from '@ant-design/icons';
import newImage from './drap-images/new.svg';
import replaceImage from './drap-images/replace.svg';
import propsImage from './drap-images/props.svg';
import wrapperImage from './drap-images/wrapper.svg';
import moveImage from './drap-images/move.svg';
import {v4 as uuid} from 'uuid';

const dragImages = {
    replace: replaceImage,
    props: propsImage,
    wrapper: wrapperImage,
    new: newImage,
    move: moveImage,
};

export const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
export const TRIGGER_SIZE = 20;

export async function getImageUrlByClipboard(e) {
    return new Promise((resolve, reject) => {
        const items = e.clipboardData && e.clipboardData.items;
        let file = null;
        if (items && items.length) {
            // 检索剪切板items
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    file = items[i].getAsFile();
                    break;
                }
            }
        }

        if (!file) return reject(new Error('clipboardData is not an image!'));

        const reader = new FileReader();
        reader.onload = function(event) {
            resolve(event.target.result);
        };
        reader.onerror = function(err) {
            reject(err);
        };
        reader.readAsDataURL(file);
    });
}

export function deleteNodeByKeyDown(e, id, activeElement, dragPageAction) {
    if (!id) return;
    const {metaKey, ctrlKey, key} = e;
    const metaOrCtrl = metaKey || ctrlKey;

    // Backspace Delete 键也删除 要区分是否有输入框获取焦点
    if (['Delete', 'Backspace'].includes(key)) {

        if (activeElement && ['INPUT', 'TEXTAREA'].includes(activeElement.tagName)) {
            return;
        }
        dragPageAction.deleteNodeById(id);
    }

    // command(ctrl) + d 删除选中节点
    if (metaOrCtrl && key === 'd') {
        e.stopPropagation();
        e.preventDefault();
        dragPageAction.deleteNodeById(id);
    }
}

// 复制兼容函数
function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement('textarea');
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
    } catch (err) {
    }

    document.body.removeChild(textArea);
}

// 复制到剪切板
export function copyTextToClipboard(text) {
    if (!window.navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }

    // 返回promise
    window.navigator.clipboard.writeText(text);
}

// 获取剪切板中内容
export function getTextFromClipboard() {
    return window.navigator.clipboard.readText();
}

// 添加占位符
export function addDragHolder(node) {
    if (!node) return;

    const {componentName, children} = node;
    const nodeConfig = getComponentConfig(componentName);
    const {isContainer, withHolder, holderProps} = nodeConfig;

    if (isContainer && withHolder && !children?.length) {
        node.children = [
            {
                id: uuid(),
                componentName: 'DragHolder',
                props: {...holderProps},
            },
        ];
    }
}


export function getTargetNode(
    {
        draggingNode,
        pageConfig,
        documentElement,
        targetElement,
        pageY,
        pageX,
        horizontal = true,
        simple = false,
    },
) {
    if (!targetElement) return null;

    const componentId = getIdByElement(targetElement);

    if (!componentId) return null;

    const loopParent = () => getTargetNode({
        draggingNode,
        pageConfig,
        documentElement,
        targetElement: getDraggableNodeEle(targetElement.parentNode),
        pageY,
        pageX,
    });

    // 如果投放的目标节点是当前拖拽节点的子节点，不作为投放目标节点
    if (findNodeById(draggingNode, componentId)) return loopParent();

    const {
        hoverPosition,
    } = getElementInfo(targetElement, {
        documentElement,
        viewSize: true,
        hoverPosition: true,
        horizontal,
        simple,
        pageY,
        pageX,
    });

    const targetNode = findNodeById(pageConfig, componentId);

    const result = {
        targetNode,
        targetHoverPosition: hoverPosition,
    };

    // 如果是设置属性或者设置包裹，直接返回，不做accept判断
    if (['props', 'wrapper'].includes(draggingNode.dropType)) return result;

    const {isContainer} = getComponentConfig(targetNode.componentName);
    if (
        hoverPosition === 'center'
        && isContainer
        && isAccept({draggingNode, targetNode, pageConfig})
    ) {
        return result;
    }

    // 插入到父级，或者替换当前节点，要判断父级是否接收
    if ((hoverPosition && hoverPosition !== 'center') || draggingNode.dropType === 'replace') {
        const parentNode = findParentNodeById(pageConfig, targetNode.id);
        if (!parentNode) return null;

        const {isContainer} = getComponentConfig(parentNode.componentName);
        if (isContainer && isAccept({draggingNode, targetNode: parentNode, pageConfig})) {
            return result;
        }
    }

    return loopParent();
}

/**
 * 判断 draggingNode 是否可以放入 targetNode
 * @param draggingNode
 * @param targetNode
 * @param pageConfig
 * @returns {boolean}
 */
function isAccept({draggingNode, targetNode, pageConfig}) {
    let {dropInTo} = getComponentConfig(draggingNode?.config?.componentName) || {};

    const args = {
        draggingNode,
        targetNode,
        pageConfig,
    };

    if (typeof dropInTo === 'function') {
        if (!dropInTo(args)) return false;
    }

    if (typeof dropInTo === 'string') dropInTo = [dropInTo];

    if (Array.isArray(dropInTo)) {
        if (!dropInTo.includes(targetNode.componentName)) return false;
    }

    let {dropAccept} = getComponentConfig(targetNode?.componentName) || {};

    if (typeof dropAccept === 'function') {
        if (!dropAccept(args)) return false;
    }

    if (typeof dropAccept === 'string') dropAccept = [dropAccept];

    if (Array.isArray(dropAccept)) {
        if (!(dropAccept.some(name => name === draggingNode?.config?.componentName))) return false;
    }

    return true;
}

// 获取可拖拽节点dome元素
export function getDraggableNodeEle(target) {
    if (!target) return target;

    if (typeof target.getAttribute !== 'function') return null;

    let isNodeEle = (typeof target.className === 'string')
        && target.className.includes('id_')
        && target.getAttribute('draggable') === 'true'
    ;

    if (isNodeEle) return target;

    return getDraggableNodeEle(target.parentNode);
}

/**
 * 根据dom元素获取配置id
 * @param element
 * @returns {string}
 */
export function getIdByElement(element) {
    const result = /id_(.*)/.exec(element.className);
    if (!result) return '';

    let id = result[1];
    if (!id) return '';

    id = id.split(' ')[0];
    return id;
}

/**
 * 设置拖拽图片
 * @param e 拖拽事件
 * @param dropType
 */
export function setDragImage(e, dropType) {
    const src = dragImages[dropType] || dragImages.new;

    const img = new Image();
    img.src = '123' || src; // TODO
    img.style.width = '40px';

    e.dataTransfer.setDragImage(img, 0, 16);
}

// 树过滤函数
export function filterTree(array, filter) {
    const getNodes = (result, node) => {
        if (filter(node)) {
            result.push(node);
            return result;
        }
        if (Array.isArray(node.children)) {
            const children = node.children.reduce(getNodes, []);
            if (children.length) result.push({...node, children});
        }
        return result;
    };

    return array.reduce(getNodes, []);
}

// 根据 componentName 获取组件
export function getComponent(options) {
    let {componentName} = options;
    const componentConfig = getComponentConfig(componentName);
    const {renderComponentName, componentType} = componentConfig;

    componentName = renderComponentName || componentName;

    const [name, subName] = componentName.split('.');

    const com = (Com, packageName) => {
        if (subName) Com = Com[subName];

        return {
            component: Com,
            packageName,
            name: subName || name,
            subName,
            exportName: name,
            dependence: {
                destructuring: true, // 解构方式
            },
        };
    };

    if (componentType === '@ra-lib/admin') {
        const raCom = raLibComponent[name];
        if (raCom) return com(raCom, '@ra-lib/admin');
    }

    const Com = components[name];
    if (Com) return com(Com);

    const AntdCom = antdComponent[name];
    if (AntdCom) return com(AntdCom, 'antd');

    const AntdIcon = antdIcon[name];
    if (AntdIcon) return com(AntdIcon, '@ant-design/icons');

    return com(name);
}

// 判断字符串是否是函数
export function isFunctionString(value) {
    return value
        && typeof value === 'string'
        && (value.includes('function') || value.includes('=>'));
}

// 设置表单元素name
export function getFormItemName(itemNode, pageConfig) {
    const formNode = findParentNodeByName(pageConfig, 'Form', itemNode.id);
    const items = findNodesByName(formNode, 'Form.Item');
    if (!items?.length) return itemNode.props.name;
    const names = items.map(node => node?.props?.name).filter(item => !!item);
    return getNextField(names, 'field');
}

// 获取obj中字段名，比如 field = visible, obj中存在obj.visible,将得到 visible2
export function getNextField(obj, field) {
    if (typeof obj === 'object' && !Array.isArray(obj) && !(field in obj)) return field;

    const nums = [0];
    const keys = Array.isArray(obj) ? obj : Object.keys(obj);
    keys.forEach(key => {
        const result = RegExp(`${field}(\\d+$)`).exec(key);
        if (result) {
            nums.push(window.parseInt(result[1]));
        }
    });

    const num = Math.max(...nums) + 1;

    return `${field}${num}`;
}

// 获取字段配置信息
export function getFieldOption(node, field) {
    const config = getComponentConfig(node?.componentName);
    if (!config) return null;

    const {fields} = config;


    const loopFields = fields => {
        if (!fields?.length) return null;
        for (let opt of fields) {
            if (opt.field === field) return opt;

            if (Array.isArray(opt.type)) {
                const fs = opt.type.find(item => item.value === 'object');
                if (fs) {
                    const result = loopFields(fs.fields);
                    if (result) return result;
                }
            }

            if (typeof opt.type === 'object' && opt.type.value === 'object') {
                const result = loopFields(opt.type.fields);
                if (result) return result;
            }
        }
    };

    return loopFields(fields);
}

/**
 * 获取元素在可视窗口内位置、尺寸、滚动等信息
 * @param element
 * @param options
 * @returns {{top: number, left: number, bottom: number, width: number, right: number, scrollTop, height: number}}
 */
export function getElementInfo(element, options = {}) {
    let {top, left, bottom, right, width, height} = element.getBoundingClientRect();
    const {scrollTop} = element;
    const {scale = 100} = options;

    if (options?.viewSize) {
        const {documentElement} = options;
        const {scrollTop, scrollLeft, clientHeight, clientWidth} = documentElement;

        if (top < 0) {
            if (height + top > clientHeight) {
                height = clientHeight;
            } else {
                height = height + top;
            }

            top = scrollTop;
        } else {
            if (height + top > clientHeight) {
                height = clientHeight - top;
            }
            top += scrollTop;
        }

        if (left < 0) {
            if (width + left > clientWidth) {
                width = clientWidth;
            } else {
                width = width + left;
            }
            left = scrollLeft;
        } else {
            if (width + left > clientWidth) {
                width = clientWidth - left;
            }
            left += scrollLeft;
        }
    }


    let hoverPosition;

    if (options?.hoverPosition) {
        let {documentElement, pageY, pageX, horizontal, simple} = options;
        const {scrollTop, scrollLeft} = documentElement;

        pageY = pageY - scrollTop;
        pageX = pageX - scrollLeft;
        // 水平
        let horizontalTriggerSize = TRIGGER_SIZE;
        if (width < TRIGGER_SIZE * 3) horizontalTriggerSize = width / 3;

        // 垂直
        let verticalTriggerSize = TRIGGER_SIZE;
        if (height < TRIGGER_SIZE * 3) verticalTriggerSize = height / 3;

        hoverPosition = (() => {
            const isTop = pageY > top && pageY < top + verticalTriggerSize;
            const isBottom = pageY > top + height - verticalTriggerSize && pageY < top + height;
            const isLeft = pageX > left && pageX < left + horizontalTriggerSize;
            const isRight = pageX > left + width - horizontalTriggerSize && pageX < left + width;

            if (horizontal) {
                if (isLeft) return 'left';
                if (isRight) return 'right';
                if (!simple) {
                    if (isTop) return 'top';
                    if (isBottom) return 'bottom';
                }
            }
            if (isTop) return 'top';
            if (isBottom) return 'bottom';
            if (!simple) {
                if (isLeft) return 'left';
                if (isRight) return 'right';
            }

            return 'center';
        })();
    }

    return {
        width: width / (scale / 100),
        height: height / (scale / 100),
        top: top / (scale / 100),
        right: right / (scale / 100),
        bottom: bottom / (scale / 100),
        left: left / (scale / 100),
        scrollTop,
        hoverPosition,
    };
}

/**
 * 元素在容器组件中是否可见
 * @param element
 * @param container
 */
export function isElementVisible(container = document.body, element) {
    const elementInfo = getElementInfo(element);
    const containerInfo = getElementInfo(container);

    return (elementInfo.top > containerInfo.top && elementInfo.top < containerInfo.bottom)
        || (elementInfo.bottom < containerInfo.bottom && elementInfo.bottom > containerInfo.top);
}


/**
 * 滚动元素到可视窗口内
 * @param container 元素容器
 * @param element 需要滚动的元素
 * @param toTop 滚动到顶部，默认滚动到容器中间位置
 * @param force 元素是否可见都滚动
 * @param offsetTop 滚动到顶部偏移距离
 */
export function scrollElement(container, element, toTop, force, offsetTop = 0) {
    if (!element) return;

    const visible = isElementVisible(container, element);
    const elementInfo = getElementInfo(element);
    const containerInfo = getElementInfo(container);

    // 元素顶部距离容器顶部的距离
    const elementTopInContainer = elementInfo.top - containerInfo.top + containerInfo.scrollTop;
    const containerHeight = containerInfo.height;
    const scrollTop = toTop ? elementTopInContainer + offsetTop : elementTopInContainer - containerHeight / 2 + offsetTop;

    if (force) {
        // 是否可见都滚动
        container.scrollTop = scrollTop;
    } else if (!visible) {
        // 只有非可见情况下才滚动
        container.scrollTop = scrollTop;
    }
}
