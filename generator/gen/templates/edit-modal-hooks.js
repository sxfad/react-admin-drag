const DELETE_THIS_LINE = 'DELETE_THIS_LINE';
const WITH_OPTIONS_TYPE = [ 'select', 'radio-group', 'checkbox-group' ];
/**
 * 获取弹框编辑页面字符串
 */
module.exports = function(config) {
    const {
        base,
        forms,
    } = config;

    const { ModuleName, moduleName } = base;

    return `import React, {useState, useCallback} from 'react';
import {Form} from 'antd';
import {FormItem, ModalContent} from '@ra-lib/admin';
import config from 'src/commons/config-hoc';

export default config({
    modal: props => props.isEdit ? '修改' : '添加',
})(props => {
    const {isEdit, record, onOk} = props;
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    
    // 编辑时，查询详情数据
    props.ajax.useGet('${base.ajax.detail.url}', record?.id, [], {
        mountFire: isEdit,
        setLoading,
        formatResult: res => {
            if (!res) return;
            form.setFieldsValue(res);
        },
    });
    const {run: save} = props.ajax.usePost('${base.ajax.add.url}', null, {setLoading, successTip: '创建成功！'});
    const {run: update} = props.ajax.usePost('${base.ajax.modify.url}', null, {setLoading, successTip: '修改成功！'});

    const handleSubmit = useCallback(async values => {
        if(loading) return;
        
        const params = {
            ...values,
        };

        if (isEdit) {
            await update(params);
        } else {
            await save(params);
        }

        onOk && onOk();
    }, [loading, isEdit, update, save]);

    const layout = {
        labelCol: {flex: '100px'},
    };
    return (
        <ModalContent
            loading={loading}
            okText="保存"
            cancelText="重置"
            onOk={() => form.submit()}
            onCancel={() => form.resetFields()}
        >
            <Form
                name="${moduleName}-modal-edit"
                form={form}
                onFinish={handleSubmit}
            >
                {isEdit ? <FormItem type="hidden" name="id"/> : null}
                ${forms.map(item => `<FormItem
                    {...layout}
                    ${item.type !== 'input' ? `type="${item.type}"` : DELETE_THIS_LINE}
                    label="${item.label}"
                    name="${item.field}"
                    ${item.required ? 'required' : DELETE_THIS_LINE}
                    ${item.maxLength ? `maxLength={${item.maxLength}}` : DELETE_THIS_LINE}
                    ${WITH_OPTIONS_TYPE.includes(item.type) ? `options={[
                        {value: '1', label: '选项1'},
                        {value: '2', label: '选项2'},
                    ]}` : DELETE_THIS_LINE}
                />`).join('\n                ')}
            </Form>
        </ModalContent>
    );
});
`.split('\n').filter(item => item.trim() !== DELETE_THIS_LINE).join('\n');
};
