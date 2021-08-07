import s from './style.less';
import { cloneDeep } from 'lodash';
import { setNodeId } from 'src/pages/drag-page-old/node-util';
import NodeRender from 'src/pages/drag-page/node-render';
import React from 'react';

function renderPreview(data) {
    const {
        renderPreview,
        previewProps,
        previewZoom,
        previewWrapperStyle,
        config,
    } = data;

    const previewStyle = previewProps?.style || {};

    if (!renderPreview) return null;

    const componentConfig = cloneDeep(config);

    setNodeId(componentConfig);

    if (!componentConfig.props) componentConfig.props = {};

    if (previewProps) {
        componentConfig.props = {
            ...componentConfig.props,
            ...previewProps,
        };
    }

    if (previewStyle) {
        if (!componentConfig.props.style) componentConfig.props.style = {};

        componentConfig.props.style = {
            ...componentConfig.props.style,
            ...previewStyle,
        };
    }

    let preview = renderPreview === true ? (
        <NodeRender config={componentConfig} />
    ) : renderPreview;

    if (typeof preview === 'function') {
        preview = preview(config);
    }

    return (
        <div className={s.preview} style={previewWrapperStyle}>
            {previewZoom ? (
                <div className={s.previewZoom} style={{ zoom: previewZoom || 1 }}>
                    {preview}
                </div>
            ) : preview}
        </div>
    );
}


export default function ComponentItem(props) {
    const { data } = props;
    const { title, image } = data;

    return (
        <div className={s.itemWrapper}>
            <div className={s.item}>
                {title}
                {data.renderPreview ? (
                    <div className={s.preview}>
                        {image ? (
                            <div
                                draggable={false}
                                className={s.img}
                                style={{ backgroundImage: `url(${image})` }}
                            />
                        ) : (
                            renderPreview(data)
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
