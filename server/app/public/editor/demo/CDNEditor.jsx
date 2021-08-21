import React, { useCallback, useState } from 'react';
import { Button } from 'antd';
import { PageContent } from '@ra-lib/admin';
import config from 'src/commons/config-hoc';
import CodeEditor from './code-editor';

const PUBLIC_URL = process.env.PUBLIC_URL || '';

const scripts = [
    'editor/react@17.0.2.production.min.js',
    'editor/react-dom@17.0.2.production.min.js',
    'editor/props-types-17.5.2.js',
    'editor/state-local-1.0.7.min.js',
    'editor/monaco-loader-0.1.2.min.js',
    'editor/monaco-react-4.0.0.min.js',
];

export default config({
    path: '/test/editor',
    auth: false,
    layout: false,
})(function CDNEditor(props) {

    const [value, setValue] = useState('');

    const handleChange = useCallback(value => {
        setValue(value);
    }, []);

    return (
        <PageContent>
            <CodeEditor
                height={300}
                language="javascript"
                value={value}
                onChange={handleChange}
            />
        </PageContent>
    );
});
