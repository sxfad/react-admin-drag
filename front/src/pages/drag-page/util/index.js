import { getComponentConfig } from 'src/pages/drag-page/component-config';
import { findNodesByName, findParentNodeByName } from 'src/pages/drag-page/util/node-util';
import * as raLibComponent from '@ra-lib/admin';
import * as components from 'src/pages/drag-page/components';
import * as antdComponent from 'antd/es';
import * as antdIcon from '@ant-design/icons';
import componentImage from './component-16.png';

export const isMac = /macintosh|mac os x/i.test(navigator.userAgent);


/**
 * 设置拖拽图片
 * @param e 拖拽事件
 * @param node
 */
export function setDragImage(e) {
    const img = new Image();
    img.src = componentImage;
    img.style.width = '30px';
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
 * @returns {{top: number, left: number, bottom: number, width: number, right: number, scrollTop, height: number}}
 */
export function getElementInfo(element) {
    const rect = element.getBoundingClientRect();
    const scrollTop = element.scrollTop;

    return {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        scrollTop,
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
