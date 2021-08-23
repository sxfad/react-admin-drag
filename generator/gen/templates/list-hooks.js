const DELETE_THIS_LINE = 'DELETE_THIS_LINE';
const WITH_OPTIONS_TYPE = ['select', 'radio-group', 'checkbox-group'];

function renderTime(item) {
    const {title, dataIndex} = item;
    const timeStr = `, render: value => value ? moment(value).format('YYYY-MM-DD HH:mm') : null`;
    const dateStr = `, render: value => value ? moment(value).format('YYYY-MM-DD') : null`;

    if (title && title.includes('日期')) return dateStr;
    if (title && title.includes('时间')) return timeStr;
    if (dataIndex && dataIndex.toLowerCase().endsWith('time')) return timeStr;
    if (dataIndex && dataIndex.toLowerCase().endsWith('date')) return dateStr;

    return '';
}

/**
 * 获取列表页字符串
 */
module.exports = function(config) {
    let {
        base,
        pages,
        queries,
        tools,
        operators,
        table,
        columns,
    } = config;

    if (queries && !queries.length) queries = null;

    if (!table) table = {};

    const isModalEdit = !!pages.find(item => item.typeName === '弹框表单');
    const isPageEdit = !isModalEdit && !!pages.find(item => item.typeName === '页面表单');
    const hasDelete = operators && !!operators.find(item => item.text === '删除');
    const hasBatchDelete = tools && !!tools.find(item => item.text === '删除');
    let handles = null;
    const excludeHandles = ['handleDelete', 'handleBatchDelete'];
    [...(tools || []), ...(operators || [])].forEach(item => {
        const {handle} = item;
        if (handle && !excludeHandles.includes(handle)) {
            if (!handles) handles = [];
            handles.push(handle);
        }
    });

    const operatorEdit = operators && operators.find(item => item.text === '修改');
    const operatorDelete = operators && operators.find(item => item.text === '删除');

    return `import React, {useCallback, useState, useMemo} from 'react';
${tools || queries || hasBatchDelete ? `import {${(queries || tools) ? 'Button, ' : ''}${queries ? 'Form' : ''}} from 'antd';` : DELETE_THIS_LINE}
${columns.find(renderTime) ? `import moment from 'moment';` : DELETE_THIS_LINE}
import config from 'src/commons/config-hoc';
import {
    PageContent,
    ${hasBatchDelete ? 'batchDeleteConfirm,' : DELETE_THIS_LINE}
    ${queries ? 'QueryBar,' : DELETE_THIS_LINE}
    ${(!queries && tools) ? 'ToolBar,' : DELETE_THIS_LINE}
    ${queries ? 'FormItem,' : DELETE_THIS_LINE}
    Table,
    ${operators ? 'Operator,' : DELETE_THIS_LINE}
    ${table.pagination ? 'Pagination,' : DELETE_THIS_LINE}
} from '@ra-lib/admin';
${isModalEdit ? 'import EditModal from \'./EditModal\';' : DELETE_THIS_LINE}

export default config({
    path: '${base.path}',
})((props) => {
    const [loading, setLoading] = useState(false);
    ${table.pagination ? `const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(20);` : DELETE_THIS_LINE}
    ${table.selectable ? 'const [selectedRowKeys, setSelectedRowKeys] = useState([]);' : DELETE_THIS_LINE}
    ${isModalEdit ? 'const [visible, setVisible] = useState(false);' : DELETE_THIS_LINE}
    ${isModalEdit ? 'const [record, setRecord] = useState(null);' : DELETE_THIS_LINE}
    ${queries ? 'const [conditions, setConditions] = useState();' : DELETE_THIS_LINE}
    ${queries ? 'const [form] = Form.useForm();' : DELETE_THIS_LINE}

    ${queries ? `const params = useMemo(() => {
        return {
            ...conditions,
            pageNum,
            pageSize,
        };
    }, [conditions${table.pagination ? ', pageNum, pageSize' : ''}]);` : DELETE_THIS_LINE}
    
    ${queries ? `// 使用现有查询条件，重新发起请求
    const refreshSearch = useCallback(() => setConditions(form.getFieldsValue()), [form]);` : DELETE_THIS_LINE}
    
    // 获取列表
    const {
        ${table.pagination ? `data: {
            dataSource,
            total,
        } = {}` : `data: dataSource`}
    } = props.ajax.useGet('${base.ajax.search.url}', ${queries ? 'params,' : 'null,'} [${queries ? 'params' : ''}], {
        setLoading,
        formatResult: res => {
            return ${table.pagination ? `{
                dataSource: res?.content || [],
                total: res?.totalElements || 0,
            }` : `res`};
        },
    });
    
    ${hasDelete ? `// 删除
    const {run: deleteRecord} = props.ajax.useDel('${base.ajax.batchDelete.url}', null, {setLoading, successTip: '删除成功！', errorTip: '删除失败！'});` : DELETE_THIS_LINE}
    ${hasBatchDelete ? `// 批量删除
    const {run: deleteRecords} = props.ajax.useDel('${base.ajax.delete.url}', null, {setLoading, successTip: '删除成功！', errorTip: '删除失败！'});` : DELETE_THIS_LINE}

    const columns = [
        ${columns.map(item => `{title: '${item.title}', dataIndex: '${item.dataIndex}', width: 200${renderTime(item)}},`).join('\n        ')}
        ${operators ? `{
            title: '操作', dataIndex: 'operator', width: 100,
            render: (value, record) => {
                const {name} = record;
                const items = [
                    ${operatorEdit ? `{
                        label: '修改',
                        ${operatorEdit.iconMode ? `icon: '${operatorEdit.icon}',` : DELETE_THIS_LINE}
                        ${isModalEdit ? 'onClick: () => setVisible(true) || setRecord(record),' : DELETE_THIS_LINE}
                        ${isPageEdit ? `onClick: () => props.history.push(\`${base.path}/_/edit/\${id}\`),` : DELETE_THIS_LINE}
                    },` : DELETE_THIS_LINE}
                    ${operatorDelete ? `{
                        label: '删除',
                        ${operatorDelete.iconMode ? `icon: '${operatorDelete.icon}',` : DELETE_THIS_LINE}
                        color: 'red',
                        confirm: {
                            title: \`您确定删除"\${name}"?\`,
                            onConfirm: () => handleDelete(record),
                        },
                    },` : DELETE_THIS_LINE}
                    ${operators.filter(item => !['修改', '删除'].includes(item.text)).map(item => `{
                        label: '${item.text}',
                        ${item.iconMode ? `icon: '${item.icon}',` : DELETE_THIS_LINE}
                        onClick: ${item.handle},
                    },`).join('\n                        ')}
                ];

                return <Operator items={items}/>
            },
        },` : DELETE_THIS_LINE}
    ];

    ${hasDelete ? `const handleDelete = useCallback(async record => {
        if(loading) return;
        await deleteRecord(record?.id);
        ${queries ? 'refreshSearch()' : ''};
    }, [loading, deleteRecord, refreshSearch]);` : DELETE_THIS_LINE}
    ${hasBatchDelete ? `const handleBatchDelete = useCallback(async () => {
        if(loading) return;
        await batchDeleteConfirm(selectedRowKeys.length);
        
        await deleteRecords(selectedRowKeys);
        ${queries ? 'refreshSearch()' : ''};
    }, [loading, selectedRowKeys,  deleteRecords, refreshSearch]);` : DELETE_THIS_LINE}

    ${handles ? handles.map(item => `const  ${item} = useCallback(() => {
        // TODO
    }, [])
    `).join('\n    ') : DELETE_THIS_LINE}

    ${queries ? 'const layout = {style: {width: 200}};' : DELETE_THIS_LINE}
    ${hasBatchDelete ? 'const disabledDelete = !selectedRowKeys?.length;' : DELETE_THIS_LINE}

    return (
        <PageContent loading={loading}>
            ${queries ? `<QueryBar>
                <Form
                    name="${base.module_name}_query"
                    layout="inline"
                    form={form}
                    initialValues={conditions}
                    onFinish={values => setPageNum(1) || setConditions(values)}
                >
                    ${queries.map(item => `<FormItem
                        {...layout}
                        ${item.type !== 'input' ? `type="${item.type}"` : DELETE_THIS_LINE}
                        label="${item.label}"
                        name="${item.field}"
                        ${WITH_OPTIONS_TYPE.includes(item.type) ? `options={[
                            {value: '1', label: '选项1'},
                            {value: '2', label: '选项2'},
                        ]}` : DELETE_THIS_LINE}
                    />`).join('\n                    ')}
                    <FormItem layout>
                        <Button type="primary" htmlType="submit">查询</Button>
                        <Button onClick={() => form.resetFields()}>重置</Button>
                        ${tools ? `${tools.find(item => item.text === '添加') ? `<Button type="primary" onClick={() => ${isModalEdit ? `setVisible(true) || setId(null)` : `props.history.push('${base.path}/_/edit/:id')`}}>添加</Button>` : DELETE_THIS_LINE}
                        ${tools.find(item => item.text === '删除') ? `<Button danger ${table.selectable ? 'disabled={disabledDelete} ' : ''}onClick={handleBatchDelete}>删除</Button>` : DELETE_THIS_LINE}
                        ${tools.filter(item => !['添加', '删除'].includes(item.text)).length ? tools.filter(item => !['添加', '删除'].includes(item.text)).map(item => `<Button type="primary" onClick={${item.handle}}>${item.text}</Button>`).join('\n                         ') : DELETE_THIS_LINE}` : DELETE_THIS_LINE}
                    </FormItem>
                </Form>
            </QueryBar>` : DELETE_THIS_LINE}
            ${(!queries && tools) ? `<ToolBar>
                ${tools ? `${tools.find(item => item.text === '添加') ? `<Button type="primary" onClick={() => ${isModalEdit ? `setVisible(true) || setId(null)` : `props.history.push('${base.path}/_/edit/:id')`}}>添加</Button>` : DELETE_THIS_LINE}
                ${tools.find(item => item.text === '删除') ? `<Button danger ${table.selectable ? 'disabled={disabledDelete} ' : ''}onClick={handleBatchDelete}>删除</Button>` : DELETE_THIS_LINE}
                ${tools.filter(item => !['添加', '删除'].includes(item.text)).length ? tools.filter(item => !['添加', '删除'].includes(item.text)).map(item => `<Button type="primary" onClick={${item.handle}}>${item.text}</Button>`).join('\n                 ') : DELETE_THIS_LINE}` : DELETE_THIS_LINE}
            </ToolBar>` : DELETE_THIS_LINE}
            <Table
                ${table.serialNumber ? 'serialNumber' : DELETE_THIS_LINE}
                ${table.selectable ? `rowSelection={{
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                }}` : DELETE_THIS_LINE}
                columns={columns}
                dataSource={dataSource}
                rowKey="id"
                ${table.serialNumber && table.pagination ? 'pageNum={pageNum}' : DELETE_THIS_LINE}
                ${table.serialNumber && table.pagination ? 'pageSize={pageSize}' : DELETE_THIS_LINE}
            />
            ${table.pagination ? `<Pagination
                total={total}
                pageNum={pageNum}
                pageSize={pageSize}
                onPageNumChange={setPageNum}
                onPageSizeChange={pageSize => setPageNum(1) || setPageSize(pageSize)}
            />` : DELETE_THIS_LINE}
            ${isModalEdit ? `<EditModal
                visible={visible}
                record={record}
                isEdit={!!record}
                onOk={() => setVisible(false) || refreshSearch()}
                onCancel={() => setVisible(false)}
            />` : DELETE_THIS_LINE}
        </PageContent>
    );
});
`.split('\n').filter(item => item.trim() !== DELETE_THIS_LINE).join('\n');
};
