import React, {useMemo} from 'react';
import {Modal} from 'antd';
import config from 'src/commons/config-hoc';
import {CodeEditor} from 'src/drag-page/components';
import schemaToCode from 'src/drag-page/dsl';

export default config({
    connect: state => {
        return {
            pageCodeVisible: state.dragPage.pageCodeVisible,
            pageConfig: state.dragPage.pageConfig,
            pageState: state.dragPage.pageState,
            pageStateDefault: state.dragPage.pageStateDefault,
            pageFunction: state.dragPage.pageFunction,
            pageVariable: state.dragPage.pageVariable,
        };
    },
})(function SourceCode(props) {
    const {
        pageCodeVisible,
        pageConfig,
        pageState,
        pageStateDefault,
        pageFunction,
        pageVariable,
        action: {dragPage: dragPageAction},
        onSave,
    } = props;

    const code = useMemo(() => {
        if (!pageCodeVisible || !pageConfig) return;

        return schemaToCode({
            pageConfig,
            pageState,
            pageStateDefault,
            pageFunction,
            pageVariable,
            useRaFormItem: true,
            classCode: false,
        });
    }, [pageCodeVisible, pageConfig, pageState, pageStateDefault, pageFunction, pageVariable]);

    return (
        <>
            <Modal
                visible={pageCodeVisible}
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
                    onSave={onSave}
                    onClose={() => dragPageAction.setFields({pageCodeVisible: false})}
                />
            </Modal>
        </>
    );
});
