import React, {useCallback, useState} from 'react';
import {Button} from 'antd';
import {PageContent} from '@ra-lib/admin';
import config from 'src/commons/config-hoc';

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
})(function CDNEditor(props) {
    const [value, setValue] = useState('const b = 444');

    const handleClick = useCallback(() => {
        setValue(`
        const a = 123;
        console.log(a);
        `);
    }, []);

    const handleChange = useCallback((code) => {
        console.log(code);

    }, []);

    const handleEditorWillMount = useCallback(monaco => {
        console.log(monaco);
    }, []);
    const handleEditorDidMount = useCallback((editor, monaco) => {
        console.log(editor, monaco);
    }, []);

    return (
        <PageContent>
            <Button onClick={handleClick}>设置</Button>
            <iframe
                title="123"
                height={300}
                srcDoc={`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>@monaco-editor/react - CND</title>
                        <!--这里只能用var，monaco-loader 中需要通过window获取-->
                        <script>var PUBLIC_URL="${PUBLIC_URL}"</script>
                        ${scripts.map(src => {
                    return `<script src="${PUBLIC_URL}/${src}" crossorigin></script>`;
                }).join('\n')}
                    </head>
                    <body style="padding: 0; margin: 0;">
                    <div id="app" style="height: 100vh;overflow: hidden"></div>

                    <script type="text/javascript">
                        const {useState, useEffect, createElement} = React;

                        function App() {
                            const Editor = monaco_react.default;
                            const [value, setValue] = useState('哈哈');
                            useEffect(() => {
                                const st = setTimeout(() => {
                                    setValue('div {background: red}');
                                }, 1000);
                                return () => clearTimeout(st);
                            }, [])

                            return createElement(Editor, {
                                theme: 'vs-dark',
                                value: value,
                                language: 'css',
                            });
                        }

                        ReactDOM.render(createElement(App), document.querySelector('#app'));
                    </script>
                    </body>
                    </html>
                `}
                frameBorder="0"
            />
        </PageContent>
    );
});
