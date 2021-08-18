import { getComponentConfig } from 'src/pages/drag-page/component-config';
import {
    findNodesByName,
    findParentNodeByName,
    findNodeById,
    findParentNodeById,
    isNode,
    loopNode,
} from 'src/pages/drag-page/util/node-util';
import * as raLibComponent from '@ra-lib/admin';
import * as components from 'src/pages/drag-page/customer-components';
import * as antdComponent from 'antd/es';
import * as antdIcon from '@ant-design/icons';
import newImage from './drap-images/new.svg';
import replaceImage from './drap-images/replace.svg';
import propsImage from './drap-images/props.svg';
import wrapperImage from './drap-images/wrapper.svg';
import moveImage from './drap-images/move.svg';
import { v4 as uuid } from 'uuid';
import PubSub from 'PubSub';
import { useEffect, useState, createElement } from 'react';
import ReactDOM from 'react-dom';
import inflection from 'inflection';

export const OTHER_HEIGHT = 0;
export const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
export const TRIGGER_SIZE = 20;

export function getFieldUUID() {
    return uuid().replaceAll('-', '_');
}


/**
 * 获取字段对应关系
 */
export function getFieldsMap(obj) {
    const result = {};

    Object.keys(obj)
        .forEach(prevField => {
            const nextField = getNextField(result, prevField.split('__')[0]);

            result[nextField] = prevField;
        });

    // key value 互换
    return Object.entries(result)
        .reduce((prev, [key, value]) => {
            prev[value] = key;
            return prev;
        }, {});
}

/**
 * 获取连接线样式
 * @param options
 * @returns {{transform: string, top, left, width: number}}
 */
export function getLinkLineStyle(options) {
    const {
        startX,
        startY,
        endX,
        endY,
    } = options;

    const w = Math.abs(startX - endX);
    const h = Math.abs(startY - endY);

    // 勾股定理算长度
    const width = Math.sqrt(w * w + h * h);

    // 计算旋转角度

    // 右下
    let deg = Math.atan(h / w) * 180 / Math.PI;
    // 右上
    if (endX > startX && endY < startY) deg = -deg;
    // 左上
    if (endX < startX && endY < startY) deg = -(180 - deg);
    // 左下
    if (endX < startX && endY > startY) deg = 180 - deg;

    return {
        top: `${startY}px`,
        left: `${startX}px`,
        width: `${width}px`,
        transform: `rotate(${deg}deg) scaleY(.5)`,
    };
}

/**
 * 删除pageState中数据
 * @param pageState
 * @param data
 * @returns {*}
 */
export function deletePageStateField(pageState, data) {
    const dataSource = Array.isArray(data) ? data : [data];

    dataSource.forEach(item => {
        if (typeof item !== 'string') return;
        if (!item.startsWith('state.')) return;

        const field = item.replace('state.', '');
        Reflect.deleteProperty(pageState, field);
    });

    return pageState;
}


/**
 * 删除pageFunction中数据
 * @param pageFunction
 * @param data
 * @returns {*}
 */
export function deletePageFunctionField(pageFunction, data) {
    const dataSource = Array.isArray(data) ? data : [data];

    dataSource.forEach(item => {
        if (typeof item !== 'string') return;
        if (!item.startsWith('func.')) return;

        const field = item.replace('func.', '');
        Reflect.deleteProperty(pageFunction, field);
    });

    return pageFunction;
}


/**
 * 删除pageVariable中数据
 * @param pageVariable
 * @param data
 * @returns {*}
 */
export function deletePageVariableField(pageVariable, data) {
    const dataSource = Array.isArray(data) ? data : [data];

    dataSource.forEach(item => {
        if (typeof item !== 'string') return;
        if (!item.startsWith('variable.')) return;

        const field = item.replace('variable.', '');
        Reflect.deleteProperty(pageVariable, field);
    });

    return pageVariable;
}

export function codeToObject(code) {

    if (!code) return null;

    const val = code.replace('export', '').replace('default', '');
    try {
        let obj = {};
        // 直接通过eval执行，保留函数
        // eslint-disable-next-line
        eval(`obj = ${val}`);

        if (typeof obj !== 'object' || Array.isArray(obj)) {
            return Error('语法错误，请修改后保存！');
        }

        const loopComponentName = node => {
            if (!node.componentName) return false;

            if (node?.children?.length) {
                for (let item of node.children) {
                    const result = loopComponentName(item);
                    if (result === false) return result;
                }
            }

            return true;
        };

        if (!loopComponentName(obj)) return Error('缺少必填字段「componentName」!');

        // 函数转字符串
        const loopFunction = node => {
            Object.entries(node)
                .forEach(([key, value]) => {
                    if (typeof value === 'function') {
                        node[key] = value.toString();
                    }
                    if (Array.isArray(value)) {
                        value.forEach(item => loopFunction(item));
                    }
                    if (typeof value === 'object' && value && !Array.isArray(value)) {
                        loopFunction(value);
                    }
                });
        };

        loopFunction(obj);

        return obj;
    } catch (e) {
        console.error(e);
        return Error('语法错误，请修改后保存！');
    }
}

export async function getNodeByImage(e) {
    try {
        const src = await getImageUrlByClipboard(e);
        return {
            componentName: 'img',
            props: {
                src,
                width: '100%',
            },
        };
    } catch (e) {
        console.error(e);
        return null;
    }
}

export function getNodeByText(e) {
    try {
        const clipboardData = e.clipboardData || window.clipboardData;
        const text = clipboardData.getData('text/plain');
        // 不是对象字符串
        if (!text || !text.startsWith('{')) return;
        const cloneNode = JSON.parse(text);

        // 不是节点
        if (!isNode(cloneNode)) return;

        return cloneNode;
    } catch (e) {
        console.error(e);
    }
}

// 获取label宽度
export function getLabelWidth(label) {
    if (!label?.length) return 0;

    // 统计汉字数，不包括标点符号
    const fontSize = 14;
    const m = label.match(/[\u4e00-\u9fff\uf900-\ufaff]/g);
    const chineseCount = (!m ? 0 : m.length);
    const otherCount = label.length - chineseCount;
    return (chineseCount + otherCount / 2) * fontSize + 30;
}

// 获取元素中间位置
export function getEleCenterInWindow(element) {
    if (!element) return null;

    const { x, y, width, height } = element.getBoundingClientRect();

    return {
        x: x + width / 2,
        y: y + height / 2,
    };
}

// 删除所有非关联id
export function deleteUnLinkedIds(nodeConfig, keepIds = []) {
    let linkedIds = findLinkSourceComponentIds(nodeConfig);

    linkedIds = linkedIds.concat(keepIds);

    loopNode(nodeConfig, node => {
        if (!linkedIds.includes(node.id)) Reflect.deleteProperty(node, 'id');
    });
}

// 获取含有关联元素的ids
export function findLinkSourceComponentIds(pageConfig) {
    const ids = [];
    loopNode(pageConfig, node => {
        const propsToSet = node.propsToSet;
        const componentId = node.id;

        if (propsToSet) {
            const targetIds = Object.entries(propsToSet)
                .filter(([, value]) => (typeof value === 'string'))
                .map(([key, value]) => {
                    return findLinkTargetComponentIds({
                        key,
                        value,
                        pageConfig,
                    });
                }).flat();

            // 存在target
            if (targetIds?.length) {
                ids.push(componentId);
            }
        }
    });

    return ids;
}

// 获取所有关联目标组件id
function findLinkTargetComponentIds(options) {
    const {
        key,
        value,
        pageConfig,
    } = options;

    const result = [];

    loopNode(pageConfig, node => {
        let { props } = node;
        if (!props) props = {};

        if (props[key] === value) {
            const targetComponentId = node?.id;
            result.push(targetComponentId);
        }
    });

    return result;
}


// 获取关联元素位置
export function findLinkTargetsPosition(options) {
    const { pageConfig, selectedNode, canvasDocument } = options;

    if (!canvasDocument) return [];

    if (!selectedNode) return [];

    const { id: componentId, propsToSet } = selectedNode;

    if (!propsToSet) return [];

    return Object.entries(propsToSet)
        .map(([key, value]) => {
            return findElementPosition({
                pageConfig,
                key,
                value,
                componentId,
                canvasDocument,
            }) || [];
        }).flat();
}

// 获取位置
function findElementPosition(options) {
    const {
        key,
        value,
        componentId: sourceComponentId,
        canvasDocument,
        pageConfig,
    } = options;

    const targetIds = findLinkTargetComponentIds({
        key,
        value,
        pageConfig,
    });

    return targetIds.map(targetComponentId => {
        let ele = canvasDocument.querySelector(`[data-component-id="${targetComponentId}"]`);
        if (!ele) {
            ele = document.getElementById(`sourceLinkPoint_${sourceComponentId}`);
        }
        if (!ele) return false;

        const { x, y, width, height } = ele.getBoundingClientRect();
        return {
            key: `${value}__${targetComponentId}`,
            propsKey: key,
            propsValue: value,
            endX: x + width / 2,
            endY: y + height / 2,
            targetComponentId,
            sourceComponentId,
        };
    }).filter(item => !!item);
}

// css 样式字符串 转 js 样式对象
export function cssToObject(css) {
    if (!css) return {};

    css = css.replace(/"/g, '');

    const ele = document.createElement('div');
    ele.innerHTML = `<div style="${css}"></div>`;

    const style = ele.childNodes[0].style || {};

    const cssKeys = css.split(';').map(item => {
        const cssKey = item.split(':')[0].replace(/-/g, '_');
        const key = inflection.camelize(cssKey, true);

        return key.trim();
    }).filter(item => !!item);

    return cssKeys.reduce((prev, key) => {
        const value = style[key];
        if (
            value === ''
            || value === 'initial'
            || key.startsWith('webkit')
            || !window.isNaN(key) // key 是数字
        ) return prev;

        prev[key] = value;
        return prev;
    }, {});
}

// js 样式对象 转 css 字符串
export async function objectToCss(style) {
    return new Promise((resolve, reject) => {

        if (!style) return resolve('');

        const ele = document.createElement('div');
        ele.style.position = 'fixed';
        ele.style.zIndex = -999;
        ele.style.top = '-1000px';

        document.body.append(ele);

        ReactDOM.render(createElement('div', { style }), ele);

        setTimeout(() => {
            const css = ele.childNodes[0].style.cssText;

            ele.remove();

            resolve(css);
        });
    });
}


const pubsub = new PubSub();

export function emitUpdateNodes(data) {
    pubsub.publish('update-nodes', data);
}
/**
 * 任何节点改动，认为是pageConfig改动
 * @returns {{}} 变化后的数据，需要跟pageConfig一起作为hooks依赖
 */
export function usePageConfigChange() {
    const [refresh, setRefresh] = useState({});
    useEffect(() => {
        const onUpdateNode = pubsub.subscribe('update-nodes', () => setRefresh({}));
        return () => {
            pubsub.unsubscribe(onUpdateNode);
        };
    }, []);

    return refresh;
}

/**
 * 节点变动
 * @returns {{}} 变化后的数据，需要跟pageConfig一起作为hooks依赖
 */
export function useNodeChange(node) {
    const [refresh, setRefresh] = useState({});

    useEffect(() => {
        const onUpdateNode = pubsub.subscribe('update-nodes', (nodes) => {
            if (nodes?.find(item => item.id === node?.id)) {
                setRefresh({});
            }
        });
        return () => {
            pubsub.unsubscribe(onUpdateNode);
        };
    }, [node?.id]);

    return refresh;
}


const dragImages = {
    replace: replaceImage,
    props: propsImage,
    wrapper: wrapperImage,
    new: newImage,
    move: moveImage,
};

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

// 复制兼容函数
function fallbackCopyTextToClipboard(text) {
    let textArea = document.createElement('textarea');
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
    if (!isNode(node)) return;

    const { componentName, children } = node;

    const nodeConfig = getComponentConfig(componentName);
    const { isContainer, withHolder, holderProps } = nodeConfig;

    if (isContainer && withHolder && !children?.length) {
        node.children = [
            {
                id: uuid(),
                componentName: 'DragHolder',
                props: { ...holderProps },
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
    if (!draggingNode) return null;

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

    const { isContainer } = getComponentConfig(targetNode?.componentName);
    if (
        hoverPosition === 'center'
        && isContainer
        && isAccept({ draggingNode, targetNode, pageConfig })
    ) {
        return result;
    }

    // 插入到父级，或者替换当前节点，要判断父级是否接收
    if ((hoverPosition && hoverPosition !== 'center') || draggingNode.dropType === 'replace') {
        const parentNode = findParentNodeById(pageConfig, targetNode.id);
        if (!parentNode) return null;

        const { isContainer } = getComponentConfig(parentNode.componentName);
        if (isContainer && isAccept({ draggingNode, targetNode: parentNode, pageConfig })) {
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
function isAccept({ draggingNode, targetNode, pageConfig }) {
    let { dropInTo } = getComponentConfig(draggingNode?.config?.componentName) || {};

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

    let { dropAccept } = getComponentConfig(targetNode?.componentName) || {};

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
            if (children.length) result.push({ ...node, children });
        }
        return result;
    };

    return array.reduce(getNodes, []);
}

// 根据 componentName 获取组件
export function getComponent(options) {
    let { componentName } = options;
    const componentConfig = getComponentConfig(componentName);
    const { renderComponentName, componentType } = componentConfig;

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

    const { fields } = config;


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
    let { top, left, bottom, right, width, height } = element.getBoundingClientRect();
    const { scrollTop } = element;
    const { scale = 100 } = options;

    if (options?.viewSize) {
        const { documentElement } = options;
        const { scrollTop, scrollLeft, clientHeight, clientWidth } = documentElement;

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
        let { documentElement, pageY, pageX, horizontal, simple } = options;
        const { scrollTop, scrollLeft } = documentElement;

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
