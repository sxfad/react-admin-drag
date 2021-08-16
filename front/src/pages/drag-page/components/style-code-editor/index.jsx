import React, {useCallback, useEffect, useState} from 'react';
import {message} from 'antd';
import CodeEditor from 'src/pages/drag-page/components/code-editor';
import {objectToCss, cssToObject} from 'src/pages/drag-page/util';
import s from './style.less';

export default function StyleCodeEditor(props) {
    const {
        value,
        onChange,
        onCancel,
        width,
    } = props;

    const [code, setCode] = useState('*{}');

    const handleSave = useCallback((value, errors) => {
        if (errors?.length) return message.error('有语法错误，请修改后保存！');

        if (!value) {
            onChange({});
            return;
        }

        let val = value.replace('*', '').trim();
        val = val.substring(1, val.length - 1);
        const style = cssToObject(val);

        onChange(style);
        return message.success('保存成功！');
    }, [onChange]);

    useEffect(() => {
        const obj = Object.entries(value || {})
            .reduce((prev, curr) => {
                const [key, val] = curr;
                if (key.startsWith('__')) return prev;

                prev[key] = val;

                return prev;
            }, {});
        objectToCss(obj).then(c => setCode(`* {${c}}`));
    }, [value]);

    return (
        <div className={s.root}>
            <CodeEditor
                editorWidth={width}
                language="css"
                title="样式源码编辑"
                value={code}
                onClose={onCancel}
                onSave={handleSave}
            />
        </div>
    );
}
