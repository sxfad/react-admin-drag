import React from 'react';
import {SelectedNode} from 'src/pages/drag-page/components';
import {getComponentConfig} from 'src/pages/drag-page/component-config';
import {Icon} from 'src/components';
import ObjectElement from '../object-element';
import s from './style.less';

export default function PropsFormEditor(props) {
    const {
        node,
        onChange,
        onCodeEdit,
        tip,
        tool,
    } = props;

    const {fields} = getComponentConfig(node?.componentName);
    const value = node?.props || {};

    return (
        <div>
            <div className={s.header}>
                <SelectedNode tip={tip} node={node}/>
                <div>
                    {tool}
                    <Icon
                        type="icon-code"
                        disabled={!node}
                        className={s.tool}
                        onClick={() => onCodeEdit()}
                    />
                </div>
            </div>
            <div className={s.root}>
                <ObjectElement
                    node={node}
                    fields={fields}
                    value={value}
                    onChange={onChange}
                />
            </div>
        </div>
    );
}
