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

function getImport(options) {
    const {
        hasTools,
        hasQueries,
        hasBatchDelete,
        hasOperator,
        hasPagination,
        hasTime,
        isModalEdit,
    } = options;

    const imports = [
        {
            packageName: 'react',
            defaultExport: '',
            exports: ['useCallback', 'useState', 'useMemo'],
        },
        {
            packageName: '@ra-lib/admin',
            exports: ['PageContent', 'Table'],
        },
    ];
    const getImp = name => {
        let imp = imports.find(item => item.packageName === name);
        if (!imp) {
            imp = {
                defaultExport: '',
                packageName: name,
                exports: [],
            };
            imports.push(imp);
        }

        return imp;
    };
    const setExports = (packageName, name) => {
        const imp = getImp(packageName);
        name.forEach(n => {
            if (!imp.exports.some(item => item === n)) imp.exports.push(n);
        });
    };

    // 查询条件需要的包
    if (hasQueries) {
        setExports('antd', [
            'Button',
            'Form',
            'Space',
        ]);
        setExports('@ra-lib/admin', [
            'QueryBar',
            'FormItem',
        ]);
    }
    // 工具条需要的包
    if (!hasQueries && hasTools) {
        setExports('antd', [
            'Button',
        ]);
        setExports('@ra-lib/admin', [
            'ToolBar',
        ]);
    }

    // 有时间处理
    if (hasTime) {
        imports.push({
            packageName: 'moment',
            defaultExport: 'moment',
            exports: [],
        });
    }

    // 操作列需要
    if (hasOperator) {
        setExports('@ra-lib/admin', [
            'Operator',
        ]);
    }
    // 分页
    if (hasPagination) {
        setExports('@ra-lib/admin', [
            'Pagination',
        ]);
    }

    // 批量删除
    if (hasBatchDelete) {
        setExports('@ra-lib/admin', [
            'batchDeleteConfirm',
        ]);
    }

    imports.push({
        packageName: 'src/commons/config-hoc',
        defaultExport: 'config',
        exports: [],
    });

    if (isModalEdit) {
        imports.push({
            packageName: './EditModal',
            defaultExport: 'EditModal',
            exports: [],
        });
    }

    return imports.map(item => {
        const {packageName, defaultExport, exports = []} = item;
        const defaultExportStr = defaultExport ? `${defaultExport}${exports.length ? ', ' : ''}` : '';

        let exportsStr = exports && exports.length ? `{\n    ${exports.join(',\n    ')}\n}` : '';
        if (exports.length && exports.length < 5) {
            exportsStr = `{${exports.join(', ')}}`;
        }

        return `import ${defaultExportStr}${exportsStr} from '${packageName}';`;
    }).join('\n');
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

    const {ModuleName, module_name} = base;
    const isModalEdit = !!pages.find(item => item.typeName === '弹框表单');
    const isPageEdit = !isModalEdit && !!pages.find(item => item.typeName === '页面表单');
    const hasDelete = operators && !!operators.find(item => item.text === '删除');
    const hasBatchDelete = tools && !!tools.find(item => item.text === '删除');
    const hasPagination = table.pagination;
    const hasOperator = !!operators;
    const hasTools = !!tools;
    const hasTime = columns.find(renderTime);
    const hasQueries = !!queries;
    const hasSelectable = table.selectable;
    const hasSerialNumber = table.serialNumber;

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

    const options = {
        hasTools,
        hasQueries,
        hasBatchDelete,
        hasOperator,
        hasPagination,
        hasTime,
        isModalEdit,
    };


    return `${getImport(options)}

export default config({
    path: '${base.path}',
})(function ${ModuleName} (props){
    const [loading, setLoading] = useState(false);
    ${hasPagination ? `const [pageNum, setPageNum] = useState(1);` : DELETE_THIS_LINE}
    ${hasPagination ? `const [pageSize, setPageSize] = useState(20);` : DELETE_THIS_LINE}
    ${hasSelectable ? 'const [selectedRowKeys, setSelectedRowKeys] = useState([]);' : DELETE_THIS_LINE}
    ${isModalEdit ? 'const [visible, setVisible] = useState(false);' : DELETE_THIS_LINE}
    ${isModalEdit ? 'const [record, setRecord] = useState(null);' : DELETE_THIS_LINE}
    ${hasQueries ? 'const [conditions, setConditions] = useState();' : DELETE_THIS_LINE}
    ${hasQueries ? 'const [form] = Form.useForm();' : DELETE_THIS_LINE}

    ${hasQueries ? `// 查询参数
    const params = useMemo(() => {
        return {
            ...conditions,
            pageNum,
            pageSize,
        };
    }, [conditions${hasPagination ? ', pageNum, pageSize' : ''}]);` : DELETE_THIS_LINE}
    
    ${hasQueries ? `// 使用现有查询条件，重新发起请求
    const refreshSearch = useCallback(() => setConditions(form.getFieldsValue()), [form]);` : DELETE_THIS_LINE}
    
    // 获取列表
    const {
        ${hasPagination ? `data: {
            dataSource,
            total,
        } = {}` : `data: dataSource`}
    } = props.ajax.useGet('${base.ajax.search.url}', ${hasQueries ? 'params,' : 'null,'} [${hasQueries ? 'params' : ''}], {
        setLoading,
        formatResult: res => {
            return ${hasPagination ? `{
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
        ${hasOperator ? `{
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
        ${hasQueries ? 'refreshSearch()' : ''};
    }, [loading, deleteRecord, refreshSearch]);` : DELETE_THIS_LINE}
    
    ${hasBatchDelete ? `const handleBatchDelete = useCallback(async () => {
        if(loading) return;
        await batchDeleteConfirm(selectedRowKeys.length);
        
        await deleteRecords(selectedRowKeys);
        ${hasQueries ? 'refreshSearch()' : ''};
    }, [loading, selectedRowKeys,  deleteRecords, refreshSearch]);` : DELETE_THIS_LINE}

    ${handles ? handles.map(item => `const  ${item} = useCallback(() => {
        // TODO
    }, [])
    `).join('\n    ') : DELETE_THIS_LINE}

    ${hasQueries ? 'const layout = {style: {width: 200}};' : DELETE_THIS_LINE}
    ${hasBatchDelete ? 'const disabledDelete = !selectedRowKeys?.length;' : DELETE_THIS_LINE}

    return (
        <PageContent loading={loading}>
            ${hasQueries ? `<QueryBar>
                <Form
                    name="${module_name}_query"
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
                    <FormItem>
                        <Space>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button onClick={() => form.resetFields()}>重置</Button>
                            ${hasTools ? `${tools.find(item => item.text === '添加') ? `<Button type="primary" onClick={() => ${isModalEdit ? `setVisible(true) || setRecord(null)` : `props.history.push('${base.path}/_/edit/:id')`}}>添加</Button>` : DELETE_THIS_LINE}
                            ${tools.find(item => item.text === '删除') ? `<Button danger ${hasSelectable ? 'disabled={disabledDelete} ' : ''}onClick={handleBatchDelete}>删除</Button>` : DELETE_THIS_LINE}
                            ${tools.filter(item => !['添加', '删除'].includes(item.text)).length ? tools.filter(item => !['添加', '删除'].includes(item.text)).map(item => `<Button type="primary" onClick={${item.handle}}>${item.text}</Button>`).join('\n                         ') : DELETE_THIS_LINE}` : DELETE_THIS_LINE}
                        </Space>
                    </FormItem>
                </Form>
            </QueryBar>` : DELETE_THIS_LINE}
            ${(!hasQueries && hasTools) ? `<ToolBar>
                ${hasTools ? `${tools.find(item => item.text === '添加') ? `<Button type="primary" onClick={() => ${isModalEdit ? `setVisible(true) || setRecord(null)` : `props.history.push('${base.path}/_/edit/:id')`}}>添加</Button>` : DELETE_THIS_LINE}
                ${tools.find(item => item.text === '删除') ? `<Button danger ${hasSelectable ? 'disabled={disabledDelete} ' : ''}onClick={handleBatchDelete}>删除</Button>` : DELETE_THIS_LINE}
                ${tools.filter(item => !['添加', '删除'].includes(item.text)).length ? tools.filter(item => !['添加', '删除'].includes(item.text)).map(item => `<Button type="primary" onClick={${item.handle}}>${item.text}</Button>`).join('\n                 ') : DELETE_THIS_LINE}` : DELETE_THIS_LINE}
            </ToolBar>` : DELETE_THIS_LINE}
            <Table
                fitHeight
                ${hasSerialNumber ? 'serialNumber' : DELETE_THIS_LINE}
                ${hasSelectable ? `rowSelection={{
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                }}` : DELETE_THIS_LINE}
                columns={columns}
                dataSource={dataSource}
                rowKey="id"
                ${hasSerialNumber && hasPagination ? 'pageNum={pageNum}' : DELETE_THIS_LINE}
                ${hasSerialNumber && hasPagination ? 'pageSize={pageSize}' : DELETE_THIS_LINE}
            />
            ${hasPagination ? `<Pagination
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
