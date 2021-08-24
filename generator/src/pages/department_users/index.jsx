import {useCallback, useState, useMemo} from 'react';
import {
    PageContent,
    Table,
    QueryBar,
    FormItem,
    Operator,
    Pagination,
    batchDeleteConfirm
} from '@ra-lib/admin';
import {Button, Form, Space} from 'antd';
import config from 'src/commons/config-hoc';
import EditModal from './EditModal';

export default config({
    path: '/department_users',
})(function DepartmentUser (props){
    const [loading, setLoading] = useState(false);
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [visible, setVisible] = useState(false);
    const [record, setRecord] = useState(null);
    const [conditions, setConditions] = useState();
    const [form] = Form.useForm();

    // 查询参数
    const params = useMemo(() => {
        return {
            ...conditions,
            pageNum,
            pageSize,
        };
    }, [conditions, pageNum, pageSize]);
    
    // 使用现有查询条件，重新发起请求
    const refreshSearch = useCallback(() => setConditions(form.getFieldsValue()), [form]);
    
    // 获取列表
    const {
        data: {
            dataSource,
            total,
        } = {}
    } = props.ajax.useGet('/departmentUsers', params, [params], {
        setLoading,
        formatResult: res => {
            return {
                dataSource: res?.content || [],
                total: res?.totalElements || 0,
            };
        },
    });
    
    // 删除
    const {run: deleteRecord} = props.ajax.useDel('/departmentUsers', null, {setLoading, successTip: '删除成功！', errorTip: '删除失败！'});
    // 批量删除
    const {run: deleteRecords} = props.ajax.useDel('/departmentUsers/{id}', null, {setLoading, successTip: '删除成功！', errorTip: '删除失败！'});

    const columns = [
        {title: '部门', dataIndex: 'departmentId', width: 200},
        {title: '是否是领导', dataIndex: 'isLeader', width: 200},
        {title: '排序', dataIndex: 'order', width: 200},
        {title: '用户', dataIndex: 'userId', width: 200},
        {
            title: '操作', dataIndex: 'operator', width: 100,
            render: (value, record) => {
                const {name} = record;
                const items = [
                    {
                        label: '修改',
                        onClick: () => setVisible(true) || setRecord(record),
                    },
                    {
                        label: '删除',
                        color: 'red',
                        confirm: {
                            title: `您确定删除"${name}"?`,
                            onConfirm: () => handleDelete(record),
                        },
                    },
                    
                ];

                return <Operator items={items}/>
            },
        },
    ];

    const handleDelete = useCallback(async record => {
        if(loading) return;
        await deleteRecord(record?.id);
        refreshSearch();
    }, [loading, deleteRecord, refreshSearch]);
    
    const handleBatchDelete = useCallback(async () => {
        if(loading) return;
        await batchDeleteConfirm(selectedRowKeys.length);
        
        await deleteRecords(selectedRowKeys);
        refreshSearch();
    }, [loading, selectedRowKeys,  deleteRecords, refreshSearch]);


    const layout = {style: {width: 200}};
    const disabledDelete = !selectedRowKeys?.length;

    return (
        <PageContent loading={loading}>
            <QueryBar>
                <Form
                    name="department_users_query"
                    layout="inline"
                    form={form}
                    initialValues={conditions}
                    onFinish={values => setPageNum(1) || setConditions(values)}
                >
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
                    <FormItem>
                        <Space>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button onClick={() => form.resetFields()}>重置</Button>
                            <Button type="primary" onClick={() => setVisible(true) || setRecord(null)}>添加</Button>
                            <Button danger disabled={disabledDelete} onClick={handleBatchDelete}>删除</Button>
                        </Space>
                    </FormItem>
                </Form>
            </QueryBar>
            <Table
                fitHeight
                serialNumber
                rowSelection={{
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                }}
                columns={columns}
                dataSource={dataSource}
                rowKey="id"
                pageNum={pageNum}
                pageSize={pageSize}
            />
            <Pagination
                total={total}
                pageNum={pageNum}
                pageSize={pageSize}
                onPageNumChange={setPageNum}
                onPageSizeChange={pageSize => setPageNum(1) || setPageSize(pageSize)}
            />
            <EditModal
                visible={visible}
                record={record}
                isEdit={!!record}
                onOk={() => setVisible(false) || refreshSearch()}
                onCancel={() => setVisible(false)}
            />
        </PageContent>
    );
});
