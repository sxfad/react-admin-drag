import React, {useEffect, useCallback} from 'react';
import {
    PlusCircleOutlined,
    MinusCircleOutlined,
    RetweetOutlined,
} from '@ant-design/icons';
import config from 'src/commons/config-hoc';
import {UnitInput} from 'src/pages/drag-page/components';
import s from './style.less';

const INIT = 100;
const STEP = 10;
const MIN = 30;
const MAX = 200;

export default config({
    connect: state => {
        return {
            canvasScale: state.dragPage.canvasScale,
            canvasDocument: state.dragPage.canvasDocument,
        };
    },
})(function CanvasScale(props) {
    const {
        canvasScale,
        canvasDocument,
        action: {dragPage: dragPageAction},
    } = props;

    const handlePlus = useCallback(() => {
        if (canvasScale >= MAX) return;
        dragPageAction.setFields({canvasScale: canvasScale + STEP});
    }, [canvasScale, dragPageAction]);

    const handleMinus = useCallback(() => {
        if (canvasScale <= MIN) return;
        dragPageAction.setFields({canvasScale: canvasScale - STEP});
    }, [canvasScale, dragPageAction]);

    const handleReset = useCallback(() => {
        dragPageAction.setFields({canvasScale: INIT});
    }, [dragPageAction]);

    useEffect(() => {
        if (!canvasDocument) return;
        const element = canvasDocument.body;

        element.style.transformOrigin = 'left top';
        element.style.transform = `scale(${canvasScale / 100})`;

    }, [canvasDocument, canvasScale]);

    return (
        <div className={s.root}>
            <PlusCircleOutlined disabled={canvasScale >= MAX} onClick={handlePlus}/>
            <MinusCircleOutlined disabled={canvasScale <= MIN} onClick={handleMinus}/>
            <RetweetOutlined onClick={handleReset}/>
            <span className={s.inputWrapper}>
                <UnitInput
                    allowClear={false}
                    value={canvasScale}
                    onChange={e => dragPageAction.setFields({canvasScale: e.target.value})}
                />
                %
            </span>
        </div>
    );

});
