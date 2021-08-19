import React from 'react';
import {cloneDeep} from 'lodash';
import {setNodeId} from 'src/drag-page/util/node-util';
import {NodeRender} from 'src/drag-page/components';
import s from './style.less';

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
        <NodeRender config={componentConfig}/>
    ) : renderPreview;

    if (typeof preview === 'function') {
        preview = preview(config);
    }

    return (
        <div className={s.preview} style={previewWrapperStyle}>
            {previewZoom ? (
                <div className={s.previewZoom} style={{zoom: previewZoom || 1}}>
                    {preview}
                </div>
            ) : preview}
        </div>
    );
}


export default React.memo(function ComponentItem(props) {
    const {data} = props;
    const {title, image} = data;

    return (
        <div className={s.itemWrapper}>
            <div
                className={s.item}
                draggable
                data-config={JSON.stringify(data.config)}
            >
                <div className={s.title}>{title}</div>
                {data.renderPreview ? (
                    image ? (
                        <div className={s.preview}>
                            <div
                                draggable={false}
                                className={s.img}
                                style={{backgroundImage: `url(${image})`}}
                            />
                        </div>
                    ) : (
                        renderPreview(data)
                    )
                ) : null}
            </div>
        </div>
    );
});
