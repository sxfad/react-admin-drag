import {useCallback, useMemo} from 'react';
import {Button} from 'antd';
import PropTypes from 'prop-types';
import {Table, tableEditable} from '@ra-lib/admin';

const EditTable = tableEditable(Table);

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
            formProps: (record, rowIndex) => {
                return {
                    label: '',
                    type: 'input',
                    // size: 'small',
                    onChange: e => handleChange(record, 'title', e.target.value),
                };
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
            />
            <Button onClick={handleAdd} block style={{marginTop: 8}}>添加一列</Button>
        </div>
    );
}
