import React, {useState, useCallback} from 'react';
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
    props.ajax.useGet('/departmentUsers/{id}', record?.id, [], {
        mountFire: isEdit,
        setLoading,
        formatResult: res => {
            if (!res) return;
            form.setFieldsValue(res);
        },
    });
    const {run: save} = props.ajax.usePost('/departmentUsers', null, {setLoading, successTip: '创建成功！'});
    const {run: update} = props.ajax.usePost('/departmentUsers', null, {setLoading, successTip: '修改成功！'});

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
                name="departmentUsers-modal-edit"
                form={form}
                onFinish={handleSubmit}
            >
                {isEdit ? <FormItem type="hidden" name="id"/> : null}
                <FormItem
                    {...layout}
                    label="部门"
                    name="departmentId"
                />
                <FormItem
                    {...layout}
                    type="switch"
                    label="是否是领导"
                    name="isLeader"
                />
                <FormItem
                    {...layout}
                    label="排序"
                    name="order"
                />
                <FormItem
                    {...layout}
                    label="用户"
                    name="userId"
                />
            </Form>
        </ModalContent>
    );
});
