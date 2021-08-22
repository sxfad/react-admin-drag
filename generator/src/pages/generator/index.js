import { PageContent } from '@ra-lib/admin';
import config from 'src/commons/config-hoc';
import DragPage from 'src/drag-page';
import { useCallback } from 'react';
import { message, Modal } from 'antd';

export default config({
    path: '/dev-ra-gen',
    side: false,
    header: false,
    auth: false,
    connect: state => {
        return {
            pageConfig: state.dragPage.pageConfig,
        };
    },
})(function(props) {
    const { pageConfig } = props;
    const { data } = props.ajax.useGet('/ra-gen/menus', null, []);
    const { run: checkFile } = props.ajax.useGet('/ra-gen/check-file');
    const { run: saveFile } = props.ajax.usePost('/ra-gen/file', null, { successTip: '文件保存成功！' });
    const { run: fetchDirs } = props.ajax.useGet('/ra-gen/dirs');

    console.log('/ra-gen/menus', data);

    const handleSave = useCallback(() => {
        console.log('保存', pageConfig);

    }, [pageConfig]);

    const handleSaveAs = useCallback((selectedNode) => {
        console.log('另存为', selectedNode);
    }, []);

    const handleSaveCode = useCallback(async (code, errors) => {
        if (errors?.length) {
            return message.error('源码存在错误，请修改后保存！');
        }

        const dirs = await fetchDirs();

        Modal.info({
            title: '选择文件保存目录',
            content: (
                <div>文件选择</div>
            ),
            onOk: async () => {
                const createFile = async () => {
                    await saveFile({
                        filePath: '',
                        content: '',
                    });
                };
                const fileExist = await checkFile();
                if (fileExist) return Modal.confirm({
                    title: '温馨提示',
                    content: '文件已存在，是否覆盖？',
                    onOk: createFile,
                });
                await createFile();
            },
        });
    }, []);
    return (
        <PageContent style={{ padding: 0, margin: 0 }}>
            <DragPage
                onSave={handleSave}
                onSaveAs={handleSaveAs}
                onSaveCode={handleSaveCode}
            />
        </PageContent>
    );
});
