import React from 'react';
import {getComponentDisplayName} from 'src/pages/drag-page/component-config';
import {LinkPoint} from 'src/pages/drag-page/components';
import {isNode} from 'src/pages/drag-page/util/node-util';

export default function SelectedNode(props) {
    let {tip = '当前选中：', node: selectedNode} = props;

    const hasPropsToSet = selectedNode?.propsToSet;
    const name = getComponentDisplayName(selectedNode);
    const showPoint = isNode(selectedNode) && hasPropsToSet;

    return (
        <div style={{display: 'flex', alignItems: 'center'}}>
            {showPoint ? (
                <LinkPoint
                    source
                    node={selectedNode}
                    id={`sourceLinkPoint_${selectedNode?.id}`}
                    style={{marginRight: 4}}
                />
            ) : null}
            {tip} {name}
        </div>
    );
}
