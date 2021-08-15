import React, {useRef, useCallback, useEffect, useMemo} from 'react';
import ReactDOM from 'react-dom';
import config from 'src/commons/config-hoc';
import s from './style.less';
import {ConfigProvider} from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import {NodeRender} from 'src/pages/drag-page/components';
import ActionDelegation from './action-delegation';
import DragGuide from './drag-guide';
import {useNextPageConfig} from 'src/pages/drag-page/util';

export default React.memo(config({
    connect: state => {
        return {
            pageWidth: state.dragPage.pageWidth,
            pageHeight: state.dragPage.pageHeight,
            canvasWidth: state.dragPage.canvasWidth,
            canvasHeight: state.dragPage.canvasHeight,
            canvasScale: state.dragPage.canvasScale,
            pageConfig: state.dragPage.pageConfig,
            pageState: state.dragPage.pageState,
            pageFunction: state.dragPage.pageFunction,
            pageVariable: state.dragPage.pageVariable,
            viewMode: state.dragPage.viewMode,
            pageRenderRoot: state.dragPage.pageRenderRoot,
            selectedNode: state.dragPage.selectedNode,
            nodeSelectType: state.dragPage.nodeSelectType,
            draggingNode: state.dragPage.draggingNode,
            draggingElement: state.dragPage.draggingElement,
            targetNode: state.dragPage.targetNode,
            targetElementSize: state.dragPage.targetElementSize,
            targetHoverPosition: state.dragPage.targetHoverPosition,
            canvasDocument: state.dragPage.canvasDocument,
            componentPaneActiveKey: state.dragPage.componentPaneActiveKey,
            componentPaneExpended: state.dragPage.componentPaneExpended,
            componentPaneWidth: state.dragPage.componentPaneWidth,
            propsPaneExpended: state.dragPage.propsPaneExpended,
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
        pageState,
        pageFunction,
        pageVariable,
        canvasDocument,
        pageRenderRoot,
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
        componentPaneExpended,
        propsPaneExpended,
        action: {dragPage: dragPageAction},
    } = props;

    // 构建iframe内容
    const iframeSrcDoc = useMemo(() => {
        return `
        <html lang="en">
            <heade>
                ${document.head.innerHTML}
            </heade>
            <body style="padding:0; margin: 0; scroll-behavior: smooth; overflow: auto" class="${s.canvasBody}">
                <div id="page-canvas" class="${s.pageCanvas}">
                    <div id="page-render-container" class="${s.pageRoot}">
                        <div id="page-render-ele"></div>
                    </div>
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
    }, []);
    const nextPageConfig = useNextPageConfig(pageConfig);

    const iframeRef = useRef(null);
    const isPreview = viewMode === 'preview';

    // iframe加载完成后，获取document、渲染根节点等
    const handleIframeLoad = useCallback(() => {
        const canvasDocument = iframeRef.current.contentDocument;
        const pageRenderRoot = canvasDocument.getElementById('page-render-container');

        dragPageAction.setFields({canvasDocument, pageRenderRoot});
    }, [dragPageAction]);

    useEffect(() => {
        if (!pageRenderRoot) return;

        const canvas = canvasDocument.getElementById('page-canvas');

        const getStyleValue = (value) => typeof value === 'string' ? value : `${value}px`;

        canvas.style.minWidth = getStyleValue(canvasWidth);
        canvas.style.minHeight = getStyleValue(canvasHeight);

        let pWidth = getStyleValue(pageWidth);
        if (pageWidth === 'auto') {
            let otherWidth = 76;
            if (componentPaneExpended) otherWidth += componentPaneWidth;
            if (propsPaneExpended) otherWidth += propsPaneWidth;
            if (!propsPaneExpended) otherWidth += 43;

            pWidth = `${window.top.document.documentElement.clientWidth - otherWidth}px`;
        }

        pageRenderRoot.style.width = pWidth;
        pageRenderRoot.style.height = getStyleValue(pageHeight);

    }, [
        pageRenderRoot,
        canvasDocument,
        canvasWidth,
        canvasHeight,
        pageWidth,
        pageHeight,
        componentPaneWidth,
        propsPaneWidth,
        componentPaneExpended,
        propsPaneExpended,
    ]);

    // 根据pageConfig渲染页面
    useEffect(() => {
        if (!pageConfig || !pageRenderRoot) return null;
        const pageRenderEle = pageRenderRoot.querySelector('#page-render-ele');

        ReactDOM.render(
            <ConfigProvider
                locale={zhCN}
                getPopupContainer={() => pageRenderEle}
                getTargetContainer={() => pageRenderEle}
                getContainer={() => pageRenderEle}
            >
                <NodeRender
                    config={pageConfig}
                    isPreview={isPreview}
                    pageRenderRoot={pageRenderEle}
                    state={pageState}
                    func={pageFunction}
                    variable={pageVariable}
                />
            </ConfigProvider>,
            pageRenderEle,
        );
    }, [
        pageRenderRoot,
        isPreview,
        pageConfig,
        pageState,
        pageFunction,
        pageVariable,
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
                pageConfig={nextPageConfig}
                componentPaneExpended={componentPaneExpended}
                propsPaneExpended={propsPaneExpended}
                pageState={pageState}
            />
            <ActionDelegation
                componentPaneActiveKey={componentPaneActiveKey}
                pageConfig={nextPageConfig}
                dragPageAction={dragPageAction}
                draggingNode={draggingNode}
                canvasDocument={canvasDocument}
                pageRenderRoot={pageRenderRoot}
                nodeSelectType={nodeSelectType}
                selectedNode={selectedNode}
                targetNode={targetNode}
                targetHoverPosition={targetHoverPosition}
            />
        </>
    );
}));
