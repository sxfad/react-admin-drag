import dataInputs from '../data-input';

export default dataInputs.map(item => item.children).flat().map((item, index) => {
    const {title, config} = item;

    return {
        title: title,
        renderPreview: false,
        config: {
            componentName: 'Form.Item',
            props: {
                label: title,
                name: 'field' + index,
            },
            children: [config],
        },
    };
});
