import React from 'react';
import {getComponentDisplayName} from 'src/pages/drag-page/component-config';
import {LinkPoint} from 'src/pages/drag-page/components';

export default function SelectedNode(props) {
    let {
        tip = '当前选中：',
        node: selectedNode,
    } = props;

    const name = getComponentDisplayName(selectedNode);

    return (
        <div style={{display: 'flex', alignItems: 'center'}}>
            <LinkPoint
                node={selectedNode}
                style={{marginRight: 4}}
            />
            {tip} {name}
        </div>
    );
}
