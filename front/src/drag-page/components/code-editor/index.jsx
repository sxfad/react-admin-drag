import React, { useRef, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import {
    DesktopOutlined,
    FullscreenExitOutlined,
    FullscreenOutlined,
} from '@ant-design/icons';
import MonacoEditor from '@monaco-editor/react';
import prettier from 'prettier/standalone';
import parserPostCss from 'prettier/parser-postcss';
import { useHeight } from '@ra-lib/admin';
import { isMac, OTHER_HEIGHT } from 'src/drag-page/util';
import loader from '@monaco-editor/loader';
import s from './style.less';
import keyboardShortcuts from './keyboard-shortcuts.json';

const PUBLIC_URL = process.env.PUBLIC_URL || '';
// you can change the source of the monaco files
// 设置monaco相关资源使用本地
loader.config({ paths: { vs: `${PUBLIC_URL}/monaco-editor@0.27.0/min/vs` } });

function bindKeyWithAction(editor, monaco) {
    const keyMap = {
        cmd: monaco.KeyMod.CtrlCmd,
        alt: monaco.KeyMod.Alt,
        shift: monaco.KeyMod.Shift,
        ctrl: monaco.KeyMod.WinCtrl,
        backspace: monaco.KeyCode.Backspace,
        down: monaco.KeyCode.DownArrow,
        '/': monaco.KeyCode.US_SLASH,
        '\\': monaco.KeyCode.US_BACKSLASH,
        '[': monaco.KeyCode.US_OPEN_SQUARE_BRACKET,
        ']': monaco.KeyCode.US_CLOSE_SQUARE_BRACKET,
        '.': monaco.KeyCode.US_DOT,
        ',': monaco.KeyCode.US_COMMA,
        '+': monaco.KeyCode.US_EQUAL,
        '-': monaco.KeyCode.US_MINUS,
        '`': monaco.KeyCode.US_BACKTICK,
        '\'': monaco.KeyCode.US_QUOTE,
        ';': monaco.KeyCode.US_SEMICOLON,
    };

    keyboardShortcuts.filter(item => !item.command.startsWith('-'))
        .forEach(item => {
            const { key, command: actionID } = item;
            // 空 隔开多个快捷键，取第一个
            const keyCodes = key.split(' ')[0].split('+').map(k => {
                let kk = keyMap[k];
                if (kk) return kk;

                if (k.length === 1 && /[0-9a-zA-Z]/.test(k)) {
                    k = 'KEY_' + k.toUpperCase();
                } else {
                    k = k.replace(/\b(\w)(\w*)/g, ($0, $1, $2) => $1.toUpperCase() + $2);
                }

                return monaco.KeyCode[k];
            });

            const keyResult = keyCodes.reduce((prev, curr) => {
                return prev | curr;
            });

            editor.addCommand(keyResult, function() {
                editor.trigger('', actionID);
            });
        });
}

function CodeEditor(props) {
    const {
        title,
        value,
        language,
        editorWidth,
        otherHeight = 0,
        onChange,
        onSave,
        onClose,
        readOnly,
        showHeader,
    } = props;

    const mainRef = useRef(null);
    const [monaco, setMonaco] = useState(null);
    const [editor, setEditor] = useState(null);
    const [errors, setErrors] = useState([]);
    const [code, setCode] = useState('');
    const [fullScreen, setFullScreen] = useState(false);

    const oHeight = 45 + OTHER_HEIGHT + (fullScreen ? 0 : otherHeight);
    const [height] = useHeight(mainRef, oHeight, [fullScreen]);

    // 保存
    const handleSave = useCallback((code) => {
        onSave && onSave(code, errors);
    }, [onSave, errors]);

    // 格式化
    const handleFormat = useCallback(() => {
        if (language === 'css') {
            const formattedCss = prettier.format(code, { parser: 'css', plugins: [parserPostCss] });
            setCode(formattedCss);
            return;
        }
        editor.getAction(['editor.action.formatDocument'])._run();
    }, [editor, language, code]);

    // 编辑器渲染完成之后
    const handleEditorDidMount = useCallback((editor, monaco) => {
        setMonaco(monaco);
        setEditor(editor);
        editor.focus();

        // 取消选中，打开Editor 时，内容会被全部选中
        setTimeout(() => {
            editor.setSelection(new monaco.Selection(0, 0, 0, 0));
        });

        // 绑定快捷键
        bindKeyWithAction(editor, monaco);
    }, []);

    // 全屏切换操作
    const handleFullScreen = useCallback(() => {
        const nextFullScreen = !fullScreen;

        setFullScreen(nextFullScreen);
        // 全屏切换时，不失去焦点
        editor.focus();
    }, [editor, fullScreen]);

    // 关闭事件，如果是全屏状态，退出全屏，否则直接关闭
    const handleClose = useCallback(() => {
        if (fullScreen) return handleFullScreen();

        onClose();
    }, [fullScreen, handleFullScreen, onClose]);

    // 内容改变事件
    const handleChange = useCallback(code => {
        setCode(code);
        onChange(code, errors);
    }, [onChange, errors]);

    // value 或 language改变，重新设置code
    useEffect(() => {
        if (language === 'css') {
            const formattedCss = prettier.format(value, { parser: 'css', plugins: [parserPostCss] });
            setCode(formattedCss);
            return;
        }
        setCode(value);
    }, [value, language]);

    // 保存、关闭或退出全屏、格式化等快捷键
    useEffect(() => {
        if (!editor) return;

        // 保存 ctrl(⌘) + s
        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
            () => handleSave(code),
        );

        // 关闭或退出全屏 esc
        editor.addCommand(
            monaco.KeyCode.Escape,
            () => handleClose(),
        );

        // 格式化 ctrl(⌘) + shift + f
        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_F,
            () => handleFormat(),
        );
    }, [monaco, editor, code, handleSave, handleClose, handleFormat]);

    // 检测错误
    useEffect(() => {
        if (!monaco?.editor || !editor) return;
        // 300ms检测一次
        const si = setInterval(() => {
            // 获取当前窗口错误标记
            let errors = monaco.editor.getModelMarkers({
                resource: editor.getModel().uri,
            });
            // 严重程度 Hint = 1, Info = 2, Warning = 4, Error = 8
            errors = errors.filter(item => item.severity > 4);

            setErrors(errors);
        }, 300);

        // 检测3000ms之后，关闭循环检测
        const st = setTimeout(() => {
            clearInterval(si);
        }, 3000);

        return () => {
            clearInterval(si);
            clearTimeout(st);
        };
    }, [monaco, editor, code]);

    // 编辑器配置，参考：https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html
    const options = {
        selectOnLineNumbers: true,
        tabSize: 2,
        readOnly,
        minimap: {
            enabled: fullScreen,
        },
    };

    return (
        <div className={{ [s.fullScreen]: fullScreen }}>
            {showHeader ? (
                <div className={s.header}>
                    <div className={s.title}>
                        <DesktopOutlined style={{ marginRight: 4 }} /> {title}
                    </div>
                    <div className={s.tool}>
                    <span onClick={handleFullScreen}>
                        {fullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                    </span>
                    </div>
                </div>
            ) : null}

            <div className={s.root} ref={mainRef}>
                <main>
                    <MonacoEditor
                        width={fullScreen ? '100%' : editorWidth}
                        height={height}
                        language={language}
                        theme="vs-dark"
                        value={code}
                        options={options}
                        onChange={handleChange}
                        onMount={handleEditorDidMount}
                    />
                </main>
                <footer>
                    <Button
                        style={{ marginRight: 8 }}
                        onClick={handleFormat}
                    >
                        格式化({isMac ? '⌘' : 'ctrl'}+shift+f)
                    </Button>
                    {onSave ? (
                        errors?.length ? (
                            <Button
                                style={{ marginRight: 8 }}
                                type="danger"
                            >
                                有语法错误
                            </Button>
                        ) : (
                            <Button
                                style={{ marginRight: 8 }}
                                className="codeEditorSave"
                                type="primary"
                                onClick={() => handleSave(code)}
                            >
                                保存({isMac ? '⌘' : 'ctrl'}+s)
                            </Button>
                        )
                    ) : null}
                    <Button
                        className="codeEditorClose"
                        onClick={handleClose}
                    >
                        {fullScreen ? '退出全屏' : '关闭'} (Esc)
                    </Button>
                </footer>
            </div>
        </div>
    );
}

CodeEditor.propTypes = {
    language: PropTypes.string,
    title: PropTypes.any,
    value: PropTypes.string,
    onChange: PropTypes.func,
    onSave: PropTypes.func,
    onClose: PropTypes.func,
    editorWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    readOnly: PropTypes.bool,
    showHeader: PropTypes.bool,
};

CodeEditor.defaultProps = {
    showHeader: true,
    language: 'javascript',
    editorWidth: '100%',
    onChange: () => undefined,
    onClose: () => undefined,
};

export default CodeEditor;
