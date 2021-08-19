import {useCallback, useEffect} from 'react';
import config from 'src/commons/config-hoc';
import {copyTextToClipboard, getNodeByImage, getNodeByText, isInputActive} from 'src/drag-page/util';
import {message} from 'antd';
import {setNodeId} from 'src/drag-page/util/node-util';
import {panes} from 'src/drag-page/props-pane';
import {panes as componentPanes} from 'src/drag-page/component-pane';


/**
 * 全局快捷键
 * 1. 选中节点
 *      1. 删除：command(ctrl) + d 、Delete 、Backspace
 *      1. 另存为：command(ctrl) + shift + s
 *      1. 复制：command(ctrl) + c
 *      1. 粘贴：command(ctrl) + v
 *      1. 取消选中：Esc
 * 1. 保存 command(ctrl) + s
 * 1. 撤销 command(ctrl) + z
 * 1. 重做 command(ctrl) + shift + z
 * 1. 组件库中查找组件 command(ctrl) + f
 * 1. 左侧面板切换 alt + 1、2、3、4、5
 * 1. 右侧面板切换 ctrl + 1、2、3、4、5
 *
 */
export default config({
    connect: state => {
        return {
            selectedNode: state.dragPage.selectedNode,
            canvasDocument: state.dragPage.canvasDocument,
        };
    },
})(function GlobalKeyMap(props) {
    const {
        selectedNode,
        canvasDocument,
        action: {dragPage: dragPageAction},
    } = props;

    const isAllInputActive = useCallback(() => {
        return isInputActive(document) || isInputActive(canvasDocument);
    }, [canvasDocument]);

    // 选中节点 删除：command(ctrl) + d 、Delete 、Backspace
    const handleSelectedNodeDelete = useCallback(e => {
        const {metaKey, ctrlKey, key} = e;
        const metaOrCtrl = metaKey || ctrlKey;

        if (metaOrCtrl && key === 'd') {
            e.stopPropagation();
            e.preventDefault();
        }

        const selectedNodeId = selectedNode?.id;
        if (!selectedNodeId) return;

        // Backspace Delete 键也删除 要区分是否有输入框获取焦点
        // if (['Delete', 'Backspace'].includes(key) && !isInputActive()) {
        //     dragPageAction.deleteNodeById(selectedNodeId);
        // }

        // command(ctrl) + d 删除选中节点
        if (metaOrCtrl && key === 'd') {
            dragPageAction.deleteNodeById(selectedNodeId);
        }
    }, [selectedNode, dragPageAction/*, isInputActive*/]);

    // 选中节点 另存为：command(ctrl) + shift + s
    const handleSelectedNodeSaveAs = useCallback(e => {
        if (!selectedNode) return;

        const {metaKey, ctrlKey, shiftKey, key} = e;
        const metaOrCtrl = metaKey || ctrlKey;

        if (metaOrCtrl && shiftKey && key === 's') {
            e.stopPropagation();
            e.preventDefault();
            dragPageAction.saveSelectedNodeAs();
        }
    }, [selectedNode, dragPageAction]);

    // 选中节点 复制：command(ctrl) + c
    const handleSelectedNodeCopy = useCallback(e => {
        if (!selectedNode) return;

        const {metaKey, ctrlKey, key} = e;
        const metaOrCtrl = metaKey || ctrlKey;

        if (metaOrCtrl && key === 'c') {
            if (!selectedNode) return;

            const selection = window.getSelection();
            const selectionText = selection + '';

            // 用户有选中内容
            if (selectionText) return;

            // 将当前选中节点，保存到剪切板中
            copyTextToClipboard(JSON.stringify(selectedNode));
            message.success('选中节点已复制到剪切板！');
        }
    }, [selectedNode]);

    // 选中节点 取消选中：Esc
    const handleSelectedNodeCancel = useCallback(e => {
        if (!selectedNode) return;

        const {key} = e;

        if (key === 'Escape') {
            dragPageAction.setFields({
                selectedNode: null,
            });
        }
    }, [selectedNode, dragPageAction]);

    // 组件库中查找组件 command(ctrl) + f
    const handleSearchComponent = useCallback(e => {
        const {metaKey, ctrlKey, key} = e;
        const metaOrCtrl = metaKey || ctrlKey;

        if (metaOrCtrl && key === 'f') {
            e.stopPropagation();
            e.preventDefault();

            const inputEle = window.document.getElementById('search-component');
            if (!inputEle) return;

            dragPageAction.setFields({
                componentPaneActiveKey: 'componentStore',
            });

            inputEle.focus();
            inputEle.select();
        }
    }, [dragPageAction]);

    // 保存 command(ctrl) + s
    const handleSave = useCallback(e => {
        const {metaKey, ctrlKey, shiftKey, key} = e;
        const metaOrCtrl = metaKey || ctrlKey;
        if (metaOrCtrl && key === 's' && !shiftKey) {
            e.stopPropagation();
            e.preventDefault();
            dragPageAction.savePageConfig();
        }
    }, [dragPageAction]);

    // 撤销 command(ctrl) + z
    const handleUndo = useCallback(e => {
        const {metaKey, ctrlKey, shiftKey, key} = e;
        const metaOrCtrl = metaKey || ctrlKey;
        if (metaOrCtrl && key === 'z' && !shiftKey) {
            e.stopPropagation();
            e.preventDefault();
            dragPageAction.undo();
        }
    }, [dragPageAction]);

    // 重做 command(ctrl) + shift + z
    const handleRedo = useCallback(e => {
        const {metaKey, ctrlKey, shiftKey, key} = e;
        const metaOrCtrl = metaKey || ctrlKey;
        if (metaOrCtrl && shiftKey && key === 'z') {
            e.stopPropagation();
            e.preventDefault();
            dragPageAction.redo();
        }
    }, [dragPageAction]);

    // 左侧面板切换 alt + 1、2、3、4、5
    const handleSwitchComponentPane = useCallback(e => {
        const {altKey, keyCode} = e;
        const map = componentPanes.reduce((prev, curr, index) => {
            const {key} = curr;
            prev[index + 49] = key;
            return prev;
        }, {});

        if (altKey && Object.keys(map).includes(`${keyCode}`)) {
            e.stopPropagation();
            e.preventDefault();

            const componentPaneActiveKey = map[`${keyCode}`];
            dragPageAction.setFields({componentPaneActiveKey});
        }
    }, [dragPageAction]);


    // 右侧面板切换 ctrl + 1、2、3、4、5
    const handleSwitchPropsPane = useCallback(e => {
        const {metaKey, ctrlKey, key} = e;
        const metaOrCtrl = metaKey || ctrlKey;
        const map = panes.reduce((prev, curr, index) => {
            const {key} = curr;
            prev[index + 1] = key;
            return prev;
        }, {});

        if (metaOrCtrl && Object.keys(map).includes(key)) {
            e.stopPropagation();
            e.preventDefault();

            const propsPaneActiveKey = map[key];
            dragPageAction.setFields({propsPaneActiveKey});
        }
    }, [dragPageAction]);


    useEffect(() => {
        const handleKeydown = e => {
            handleSelectedNodeDelete(e);
            handleSelectedNodeSaveAs(e);
            handleSelectedNodeCopy(e);
            handleSelectedNodeCancel(e);
            handleSearchComponent(e);
            handleSave(e);
            handleUndo(e);
            handleRedo(e);
            handleSwitchPropsPane(e);
            handleSwitchComponentPane(e);
        };

        document.addEventListener('keydown', handleKeydown);
        canvasDocument && canvasDocument.addEventListener('keydown', handleKeydown);
        return () => {
            document.removeEventListener('keydown', handleKeydown);
            canvasDocument && canvasDocument.removeEventListener('keydown', handleKeydown);
        };
    }, [
        canvasDocument,
        handleSelectedNodeDelete,
        handleSelectedNodeSaveAs,
        handleSelectedNodeCopy,
        handleSelectedNodeCancel,
        handleSearchComponent,
        handleSave,
        handleUndo,
        handleRedo,
        handleSwitchPropsPane,
        handleSwitchComponentPane,
    ]);

    // 粘贴事件
    useEffect(() => {
        if (!canvasDocument) return;

        const handlePaste = async (e) => {
            if (!selectedNode) return;

            if (isAllInputActive()) return;

            const node = await getNodeByText(e) || await getNodeByImage(e);

            if (!node) return;

            e.stopPropagation();
            e.preventDefault();

            setNodeId(node, true);

            // 插入
            dragPageAction.insertNode({
                draggingNode: {
                    id: node.id,
                    type: 'copy',
                    config: node,
                },
                targetNode: selectedNode,
                targetHoverPosition: 'right',
            });

            // 等待插入结束之后，清空相关数据
            setTimeout(() => {
                dragPageAction.setFields({
                    draggingNode: null,
                    targetHoverPosition: null,
                });
            });
        };

        document.addEventListener('paste', handlePaste);
        canvasDocument && canvasDocument.addEventListener('paste', handlePaste);
        return () => {
            document.removeEventListener('paste', handlePaste);
            canvasDocument && canvasDocument.removeEventListener('paste', handlePaste);
        };
    }, [
        canvasDocument,
        dragPageAction,
        selectedNode,
        isAllInputActive,
    ]);

    return null;
});
