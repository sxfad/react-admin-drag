import config from 'src/commons/config-hoc';
import {useMemo} from 'react';

export default config({
    connect: state => {
        return {
            draggingNode: state.dragPage.draggingNode,
            targetNode: state.dragPage.targetNode,
            targetHoverPosition: state.dragPage.targetHoverPosition,
        };
    },
})(function Tip(props) {
    const {
        draggingNode,
        targetNode,
        targetHoverPosition,
    } = props;

    const message = useMemo(() => {
        if (!draggingNode || !targetNode) return;

        const position = {
            top: '前',
            left: '前',
            center: '内',
            bottom: '后',
            right: '后',
        }[targetHoverPosition];

        const {componentName: name} = targetNode;

        const {type, dropType} = draggingNode;

        if (dropType === 'props') return `设置 ${name}属性`;
        if (dropType === 'replace') return `替换 ${name}`;
        if (dropType === 'wrapper') return `包裹 ${name}`;

        if (type === 'new') return `在 ${name} ${position} 新建节点`;
        if (type === 'move') return `移动到 ${name} ${position}`;

    }, [
        draggingNode,
        targetNode,
        targetHoverPosition,
    ]);

    return (
        <div>
            {message}
        </div>
    );
});
