import config from 'src/commons/config-hoc';
import {useMemo} from 'react';
import {GUIDE_COLORS} from 'src/pages/drag-page/component-canvas/iframe-render/drag-guide';

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

        const color = (GUIDE_COLORS[dropType] || GUIDE_COLORS.default)(1);

        if (dropType === 'props') return <span style={{color}}>设置 {name} 属性</span>;
        if (dropType === 'replace') return <span style={{color}}>替换 {name} </span>;
        if (dropType === 'wrapper') return <span style={{color}}>包裹 {name} </span>;

        if (type === 'new') return <span style={{color}}>在 {name} {position} 新建节点</span>;
        if (type === 'move') return <span style={{color}}>移动到 {name} {position}</span>;

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
