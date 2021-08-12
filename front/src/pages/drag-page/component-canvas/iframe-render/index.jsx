import React, {useRef, useCallback, useEffect} from 'react';
import ReactDOM from 'react-dom';
import config from 'src/commons/config-hoc';
import s from './style.less';
import {ConfigProvider} from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import NodeRender from 'src/pages/drag-page/node-render';
import ActionDelegation from './action-delegation';
import DragGuide from './drag-guide';
import Scale from './scale';

// 构建iframe内容
const headHtml = document.head.innerHTML;
const iframeSrcDoc = `
    <html lang="en">
        <heade>
            ${headHtml}
        </heade>
        <body style="padding:0; margin: 0; scroll-behavior: smooth; overflow: auto" class="${s.canvasBody}">
            <div id="page-canvas">
                <div id="dnd-container" class="${s.pageRoot}"></div>
            </div>
            <div id="drop-guide-line" style="display: none">
                <span>前</span>
            </div>
            <div id="drop-guide-bg" style="display: none;">
                <div id="drop-guide-name"/>
            </div>
        </body>
    </html>
`;

export default React.memo(config({
    connect: state => {
        return {
            pageWidth: state.dragPage.pageWidth,
            pageHeight: state.dragPage.pageHeight,
            canvasWidth: state.dragPage.canvasWidth,
            canvasHeight: state.dragPage.canvasHeight,
            canvasScale: state.dragPage.canvasScale,
            pageConfig: state.dragPage.pageConfig,
            viewMode: state.dragPage.viewMode,
            canvasRenderRoot: state.dragPage.canvasRenderRoot,
            selectedNode: state.dragPage.selectedNode,
            nodeSelectType: state.dragPage.nodeSelectType,
            draggingNode: state.dragPage.draggingNode,
            draggingElement: state.dragPage.draggingElement,
            targetNode: state.dragPage.targetNode,
            targetElementSize: state.dragPage.targetElementSize,
            targetHoverPosition: state.dragPage.targetHoverPosition,
            canvasDocument: state.dragPage.canvasDocument,
            componentPaneActiveKey: state.dragPage.componentPaneActiveKey,
            componentPaneWidth: state.dragPage.componentPaneWidth,
            propsPaneWidth: state.dragPage.propsPaneWidth,
        };
    },
})(function IframeRender(props) {
    const {
        canvasWidth,
        canvasHeight,
        canvasScale,
        pageWidth,
        pageHeight,
        viewMode,
        pageConfig,
        canvasDocument,
        canvasRenderRoot,
        componentPaneActiveKey,
        selectedNode,
        nodeSelectType,
        draggingNode,
        draggingElement,
        targetNode,
        targetElementSize,
        targetHoverPosition,
        componentPaneWidth,
        propsPaneWidth,
        action: {dragPage: dragPageAction},
    } = props;
    const iframeRef = useRef(null);
    const isPreview = viewMode === 'preview';

    // iframe加载完成后，获取document、渲染根节点等
    const handleIframeLoad = useCallback(() => {
        const canvasDocument = iframeRef.current.contentDocument;
        const canvasRenderRoot = canvasDocument.getElementById('dnd-container');
        const canvas = canvasDocument.getElementById('page-canvas');
        const getStyleValue = (value) => typeof value === 'string' ? value : `${value}px`;

        canvas.style.minWidth = getStyleValue(canvasWidth);
        canvas.style.minHeight = getStyleValue(canvasHeight);

        canvasRenderRoot.style.width = getStyleValue(pageWidth);
        canvasRenderRoot.style.height = getStyleValue(pageHeight);

        dragPageAction.setFields({canvasDocument, canvasRenderRoot});
    }, [dragPageAction, canvasWidth, canvasHeight, pageWidth, pageHeight]);

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
                <DragGuide
                    draggingNode={draggingNode}
                    draggingElement={draggingElement}
                    targetNode={targetNode}
                    selectedNode={selectedNode}
                    canvasDocument={canvasDocument}
                    targetElementSize={targetElementSize}
                    targetHoverPosition={targetHoverPosition}
                    componentPaneWidth={componentPaneWidth}
                    propsPaneWidth={propsPaneWidth}
                    canvasScale={canvasScale}
                />
                <ActionDelegation
                    componentPaneActiveKey={componentPaneActiveKey}
                    pageConfig={pageConfig}
                    dragPageAction={dragPageAction}
                    draggingNode={draggingNode}
                    canvasDocument={canvasDocument}
                    nodeSelectType={nodeSelectType}
                    selectedNode={selectedNode}
                    targetNode={targetNode}
                    targetHoverPosition={targetHoverPosition}
                >
                    <NodeRender
                        config={pageConfig}
                        isPreview={isPreview}
                        canvasRenderRoot={canvasRenderRoot}
                        state={state}
                    />
                </ActionDelegation>
            </ConfigProvider>,
            canvasRenderRoot,
        );
    }, [
        pageConfig,
        canvasDocument,
        canvasRenderRoot,
        isPreview,
        dragPageAction,
        componentPaneActiveKey,
        selectedNode,
        nodeSelectType,
        draggingElement,
        draggingNode,
        targetNode,
        targetElementSize,
        targetHoverPosition,
        componentPaneWidth,
        propsPaneWidth,
        canvasScale,
    ]);

    return (
        <>
            <iframe
                className={s.root}
                id="dnd-iframe"
                title="页面设计"
                ref={iframeRef}
                srcDoc={iframeSrcDoc}
                onLoad={handleIframeLoad}
            />
            <Scale/>
        </>
    );
}));
