import React, {useEffect, useState} from 'react';
import {Modal} from 'antd';
import config from 'src/commons/config-hoc';
import schemaToCode from '../dsl';
import './style.less';
import CodeEditor from 'src/pages/drag-page-old/code-editor';

export default config({
    connect: state => {

        return {
            showCode: state.dragPageOld.showCode,
            pageConfig: state.dragPageOld.pageConfig,
        };
    },
})(function SourceCode(props) {
    const {
        showCode,
        pageConfig,
        action: {dragPageOld: dragPageAction},
    } = props;

    const [code, setCode] = useState('');

    useEffect(() => {
        if (showCode) {
            const code = schemaToCode(pageConfig, {
                useRaFormItem: true,
                classCode: false,
            });
            setCode(code);
        }
    }, [showCode, pageConfig]);
    return (
        <>
            <Modal
                visible={showCode}
                title={null}
                footer={null}
                closable={false}
                width="80%"
                destroyOnClose
                style={{top: 50}}
                bodyStyle={{margin: 0, padding: 0}}
            >
                <CodeEditor
                    otherHeight={25}
                    title="源码"
                    value={code}
                    onClose={() => dragPageAction.showCode(false)}
                />
            </Modal>
        </>
    );
});
