import { buttonTypeOptions } from '../options';
import { getFieldUUID } from 'src/pages/drag-page/util';

export default {
    isContainer: false,
    draggable: true,
    isWrapper: true,
    hooks: {
        beforeAdd: options => {
            const { node } = options;
            if (!node.props) node.props = {};
            const uid = getFieldUUID();
            const handleClick = `handleClick__${uid}`;
            node.__config = {
                pageFunction: {
                    [handleClick]: `() => {alert('确认')}`,
                },
            };

            node.props.onConfirm = `func.${handleClick}`;
        },
    },
    fields: [
        { label: '提示内容', field: 'title', type: 'string', version: '', desc: '提示信息' },
        { label: '确认按钮文字', field: 'okText', type: 'string' },
        { label: '确认按钮类型', field: 'okType', type: 'radio-group', options: buttonTypeOptions },
        { label: '取消按钮文字', field: 'cancelText', type: 'string' },
        { label: '气泡框位置', field: 'placement', type: 'placement', defaultValue: 'top' },
    ],
};
