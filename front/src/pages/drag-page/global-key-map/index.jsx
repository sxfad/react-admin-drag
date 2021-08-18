import config from 'src/commons/config-hoc';


/**
 * 全局快捷键
 * 1. 删除选中节点
 * 1. 另存为
 * 1. 保存
 * 1. 撤销/重做
 * 1. 复制选中节点
 * 1. 咱贴复制的节点或剪切板中的图片
 * 1. 组件库中查找组件
 * 1. 取消选中节点
 * 1. 左侧面板切换 alt + 1、2、3、4、5
 * 1. 右侧面板切换 ctrl + 1、2、3、4、5
 * 1. 拖拽节点dropType切换
 *
 * 相应方法整理到 model.js 当中
 */
export default config({
    connect: state => {
        return {
            selectedNode: state.dragPage.selectedNode,
        };
    },
})(function GlobalKeyMap(props) {
    const {
        selectedNode,
        action: {dragPage: dragPageAction},
    } = props;


    return null;
});
