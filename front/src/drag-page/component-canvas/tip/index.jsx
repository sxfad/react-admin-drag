import config from 'src/commons/config-hoc';
import {useMemo} from 'react';
import {GUIDE_COLORS} from 'src/drag-page/component-canvas/iframe-render/drag-guide';

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

        const {componentName: targetName} = targetNode;
        const draggingName = draggingNode?.config?.componentName || '组件';
        const tip = draggingNode?.tip;
        const {type, dropType, propsToSet = {}} = draggingNode;
        const color = (GUIDE_COLORS[dropType] || GUIDE_COLORS.default)(1);

        if (tip) return <span style={{color}}>{tip({draggingName, targetName, targetNode})}</span>;

        if (dropType === 'props') return <span style={{color}}>将 {draggingName} 设置为 {targetName} 的 {Object.keys(propsToSet)} 属性</span>;
        if (dropType === 'replace') return <span style={{color}}>{draggingName} 替换 {targetName} </span>;
        if (dropType === 'wrapper') return <span style={{color}}>{draggingName} 包裹 {targetName} </span>;

        if (type === 'new') return <span style={{color}}>在 {targetName} {position} 新建 {draggingName}</span>;
        if (type === 'move') return <span style={{color}}>移动 {draggingName} 到 {targetName} {position}</span>;

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
