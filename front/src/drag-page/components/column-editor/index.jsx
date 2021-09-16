import {useCallback, useMemo} from 'react';
import {Button} from 'antd';
import PropTypes from 'prop-types';
import {Table, tableEditable, tableRowDraggable} from '@ra-lib/admin';
import {v4 as uuid} from 'uuid';

const EditTable = tableRowDraggable(tableEditable(Table));

ColumnEditor.propTypes = {
    value: PropTypes.array,
    onChange: PropTypes.func,
};
ColumnEditor.defaultProps = {};

export default function ColumnEditor(props) {
    const {onChange} = props;


    const dataSource = useMemo(() => {
        return (props?.node?.props?.columns || []).map(item => ({...item}));
    }, [props?.node?.props?.columns]);

    const handleChange = useCallback((record, field, value) => {
        record[field] = value;
        onChange && onChange(dataSource);
    }, [dataSource, onChange]);

    const handleAdd = useCallback(() => {
        dataSource.push({
            title: '新增',
            dataIndex: 'field',
        });
        onChange && onChange(dataSource);
    }, [dataSource, onChange]);

    const handleDelete = useCallback((index) => {
        console.log('delete', index);
        dataSource.splice(index, 1);
        onChange && onChange([...dataSource]);
    }, [dataSource, onChange]);

    const handleSortEnd = useCallback((info) => {
        const {oldIndex, newIndex} = info;

        if (oldIndex === newIndex) return;

        const [record] = dataSource.splice(oldIndex, 1);
        dataSource.splice(newIndex, 0, record);

        onChange && onChange([...dataSource]);
    }, [dataSource, onChange]);

    const columns = [
        {
            title: '字段名', dataIndex: 'dataIndex',
            formProps: (record) => {
                return {
                    label: '',
                    type: 'input',
                    // size: 'small',
                    onChange: e => handleChange(record, 'dataIndex', e.target.value),
                };
            },
        },
        {
            title: '列名', dataIndex: 'title',
            formProps: (record) => {
                return {
                    label: '',
                    type: 'input',
                    // size: 'small',
                    onChange: e => handleChange(record, 'title', e.target.value),
                };
            },
        },
        {
            title: '操作', dataIndex: '_operator', width: 60,
            render: (value, record, index) => {
                return <a style={{color: 'red'}} onClick={() => handleDelete(index)}>删除</a>;
            },
        },
    ];

    return (
        <div>
            <EditTable
                size="small"
                columns={columns}
                dataSource={dataSource}
                onChange={handleChange}
                rowKey={() => uuid()}
                onSortEnd={handleSortEnd}
            />
            <Button onClick={handleAdd} block style={{marginTop: 8}}>添加一列</Button>
        </div>
    );
}
