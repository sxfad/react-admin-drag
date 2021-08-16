import React, {useEffect, useState, useRef} from 'react';
import {RightOutlined} from '@ant-design/icons';
import config from 'src/commons/config-hoc';
import {findParentNodes} from 'src/pages/drag-page/util/node-util';
import {getComponentDisplayName} from 'src/pages/drag-page/component-config';
import {useNextPageConfig} from 'src/pages/drag-page/util';
import {getColor} from '@ra-lib/admin';
import s from './style.less';

export default config({
    connect: state => {
        return {
            selectedNode: state.dragPage.selectedNode,
            pageConfig: state.dragPage.pageConfig,
        };
    },
})(function NodePath(props) {
    const {
        selectedNode,
        action: {dragPage: dragPageAction},
    } = props;

    const pageConfig = useNextPageConfig(props.pageConfig);

    const [paths, setPaths] = useState([]);
    const holdRef = useRef(false);

    useEffect(() => {
        if (!selectedNode) {
            setPaths([]);
            return;
        }
        if (holdRef.current) {
            holdRef.current = false;
            return;
        }

        const parentNodes = findParentNodes(pageConfig, selectedNode.id);
        setPaths([...parentNodes, selectedNode]);
    }, [selectedNode, pageConfig]);

    const SHOW_COUNT = 5;

    if (!paths?.length) return (
        <div className={s.root}>
            <div className={s.tag} style={{color: '#e23131'}}>未选中节点</div>
        </div>
    );

    return (
        <div className={s.root}>
            {paths.map((node, index) => {
                const componentDisplayName = getComponentDisplayName(node);
                if (paths.length > SHOW_COUNT && index < paths.length - SHOW_COUNT) return '.';
                const color = getColor(node?.componentName);
                return (
                    <div
                        className={s.tag}
                        key={node.id}
                        onClick={() => {
                            dragPageAction.setFields({
                                selectedNode: node,
                            });
                            holdRef.current = true;
                        }}
                        style={{color}}
                    >
                        {componentDisplayName}
                        <RightOutlined/>
                    </div>
                );
            })}
        </div>
    );
});
