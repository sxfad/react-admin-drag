import React from 'react';
import {getComponentDisplayName} from 'src/pages/drag-page-old/component-config';
import config from 'src/commons/config-hoc';
import LinkPoint from '../link-point';
import {isNode} from 'src/pages/drag-page-old/node-util';

export default config({
    connect: state => {
        return {
            // 保证页面配置改变之后，重新渲染
            pageConfig: state.dragPageOld.pageConfig,
            selectedNode: state.dragPageOld.selectedNode,
            refreshProps: state.dragPageOld.refreshProps,
        };
    },
})(function(props) {
    let {tip = '当前选中：', node, selectedNode} = props;

    selectedNode = node || selectedNode;

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
});
