import {PageContent} from '@ra-lib/admin';
import config from 'src/commons/config-hoc';
import DragPage from 'src/drag-page';
import {useCallback, useState} from 'react';
import {message, Button, Modal, Cascader, Input, Form, Space} from 'antd';

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
        const {pageConfig} = props;
        const {run: checkFile} = props.ajax.useGet('/ra-gen/check-file');
        const {run: saveFile} = props.ajax.usePost('/ra-gen/file', null, {successTip: '文件保存成功！'});
        const {run: fetchDirs} = props.ajax.useGet('/ra-gen/dirs');
        const [visible, setVisible] = useState(false);
        const [dirs, setDirs] = useState([]);
        const [code, setCode] = useState('');

        const [form] = Form.useForm();

        const handleSave = useCallback(() => {
            console.log('保存', pageConfig);

        }, [pageConfig]);

        const handleSaveAs = useCallback((selectedNode) => {
            console.log('另存为', selectedNode);
        }, []);

        const handleSubmit = useCallback(async (replace) => {
            const {filePath, dir} = await form.validateFields();
            const _dir = [...dir].pop();

            const createFile = async () => {
                await saveFile({
                    dir: _dir,
                    filePath,
                    content: code,
                });
                setVisible(false);
            };

            if (replace) return await createFile();

            const fileExist = await checkFile({dir: _dir, filePath});
            if (fileExist) return Modal.confirm({
                title: '温馨提示',
                content: '文件已存在，是否覆盖？',
                zIndex: 9999,
                onOk: createFile,
            });

            await createFile();
        }, [form, code, checkFile, saveFile]);

        const handleSaveCode = useCallback(async (code, errors) => {
            if (errors?.length) {
                return message.error('源码存在错误，请修改后保存！');
            }

            const dirs = await fetchDirs();
            setDirs(dirs);
            setVisible(true);
            setCode(code);

            form.setFieldsValue(JSON.parse(window.localStorage.getItem('dev-gen-dir') || '{}'));
        }, [fetchDirs, form]);
        return (
            <PageContent style={{padding: 0, margin: 0}}>
                <DragPage
                    onSave={handleSave}
                    onSaveAs={handleSaveAs}
                    onSaveCode={handleSaveCode}
                />
                <Modal
                    visible={visible}
                    title="选择文件路径"
                    width={450}
                    zIndex={1999}
                    onCancel={() => setVisible(false)}
                    footer={(
                        <Space>
                            <Button
                                type="primary"
                                danger
                                onClick={() => handleSubmit(true)}
                            >
                                直接覆盖
                            </Button>
                            <Button
                                type="primary"
                                onClick={() => handleSubmit()}
                            >
                                保存
                            </Button>
                            <Button
                                onClick={() => setVisible(false)}
                            >
                                取消
                            </Button>
                        </Space>
                    )}
                >
                    <Form
                        form={form}
                        onValuesChange={(changedValues, allValues) => {
                            window.localStorage.setItem('dev-gen-dir', JSON.stringify(allValues));
                        }}
                    >
                        <Space>
                            <Form.Item
                                labelCol={{space: 12}}
                                name="dir"
                                rules={[{required: true, message: '请选择目录！'}]}
                            >
                                <Cascader
                                    style={{width: 192}}
                                    options={dirs}
                                    placeholder="请选择目录"
                                    changeOnSelect
                                />
                            </Form.Item>
                            <Form.Item
                                labelCol={{space: 12}}
                                name="filePath"
                                rules={[{required: true, message: '请输入文件名！'}]}
                            >
                                <Input
                                    style={{width: 200}}
                                    placeholder="请输入文件名，目录以/分割"
                                />
                            </Form.Item>
                        </Space>
                    </Form>
                </Modal>
            </PageContent>
        );
    },
);
