import React, {useRef, useCallback, useEffect} from 'react';
import ReactDOM from 'react-dom';
import config from 'src/commons/config-hoc';
import s from './style.less';
import {ConfigProvider} from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import NodeRender from 'src/pages/drag-page/node-render';

// 构建iframe内容
const headHtml = document.head.innerHTML;
const iframeSrcDoc = `
    <html lang="en">
        <heade>
            ${headHtml}
        </heade>
        <body style="padding:0; margin: 0; scroll-behavior: smooth; overflow: auto">
            <div id="dnd-container"></div>
            <div id="drop-guide-line" style="display: none">
                <span>前</span>
            </div>
            <div id="drop-guide-bg" style="display: none;"></div>
        </body>
    </html>
`;

export default React.memo(config({
    connect: state => {
        return {
            canvasWidth: state.dragPage.canvasWidth,
            canvasHeight: state.dragPage.canvasHeight,
            pageConfig: state.dragPage.pageConfig,
            viewMode: state.dragPage.viewMode,
            canvasRenderRoot: state.dragPage.canvasRenderRoot,
            selectedNode: state.dragPage.selectedNode,
            draggingNode: state.dragPage.draggingNode,
            canvasDocument: state.dragPage.canvasDocument,
        };
    },
})(function IframeRender(props) {
    const {
        canvasWidth,
        canvasHeight,
        viewMode,
        pageConfig,
        canvasRenderRoot,
        selectedNode,
        draggingNode,
        canvasDocument,
        action: {dragPage: dragPageAction},
    } = props;
    const iframeRef = useRef(null);
    const isPreview = viewMode === 'preview';

    // iframe加载完成后，获取document、渲染根节点等
    const handleIframeLoad = useCallback(() => {
        const canvasDocument = iframeRef.current.contentDocument;
        const canvasRenderRoot = canvasDocument.getElementById('dnd-container');

        dragPageAction.setFields({canvasDocument, canvasRenderRoot});
    }, [dragPageAction]);

    // 根据pageConfig渲染页面
    useEffect(() => {
        if (!pageConfig || !canvasRenderRoot) return null;
        const state = {};
        ReactDOM.render(
            <ConfigProvider
                locale={zhCN}
                getPopupContainer={() => canvasRenderRoot}
                getTargetContainer={() => canvasRenderRoot}
                getContainer={() => canvasRenderRoot}
            >
                <NodeRender
                    config={pageConfig}
                    isPreview={isPreview}
                    state={state}
                />
            </ConfigProvider>,
            canvasRenderRoot,
        );
    }, [
        pageConfig,
        canvasRenderRoot,
        isPreview,
        draggingNode,
        dragPageAction,
        selectedNode,
        canvasDocument,
    ]);

    return (
        <iframe
            className={s.root}
            id="dnd-iframe"
            title="页面设计"
            ref={iframeRef}
            srcDoc={iframeSrcDoc}
            onLoad={handleIframeLoad}
            style={{
                width: canvasWidth || '100%',
                height: canvasHeight || '100%',
            }}
        />
    );
}));
