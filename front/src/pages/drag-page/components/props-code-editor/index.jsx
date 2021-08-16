import React, {useEffect, useRef, useState} from 'react';
import {message} from 'antd';
import JSON5 from 'json5';
import {cloneDeep} from 'lodash';
import {CodeEditor} from 'src/pages/drag-page/components';
import {getComponentConfig} from 'src/pages/drag-page/component-config';
import s from './style.less';

export default function PropsCodeEditor(props) {
    const {
        onChange,
        onCancel,
        editorWidth,
        node,
    } = props;

    const saveRef = useRef(false);
    const rootRef = useRef(null);

    const [code, setCode] = useState('');

    function codeToObject(code) {
        if (!code) return null;

        const val = code.replace('export', '').replace('default', '');
        try {
            const obj = JSON5.parse(val);

            if (typeof obj !== 'object' || Array.isArray(obj)) {
                return Error('语法错误，请修改后保存！');
            }

            return obj;
        } catch (e) {
            console.error(e);
            return Error('语法错误，请修改后保存！');
        }
    }

    function handleSave(value, errors) {
        if (errors?.length) return message.error('语法错误，请修改后保存！');

        const propsObj = codeToObject(value);

        if (propsObj instanceof Error) return message.error(propsObj.message);


        saveRef.current = true;

        onChange && onChange(propsObj);

        return message.success('保存成功！');
    }

    useEffect(() => {
        // 由于保存触发的，不做任何处理
        if (saveRef.current) {
            saveRef.current = false;
            return;
        }

        if (!node) return setCode('');

        const editNode = cloneDeep(node);

        const nodeConfig = getComponentConfig(editNode.componentName);

        const beforeSchemaEdit = nodeConfig?.hooks?.beforeSchemaEdit;

        beforeSchemaEdit && beforeSchemaEdit({node: editNode});

        const nextCode = `export default ${JSON5.stringify(editNode.props, null, 2)}`;

        setCode(nextCode);
    }, [node]);

    return (
        <div className={s.root} ref={rootRef}>
            <CodeEditor
                title="属性源码开发"
                editorWidth={editorWidth}
                value={code}
                onSave={handleSave}
                onClose={onCancel}
            />
        </div>
    );
}
