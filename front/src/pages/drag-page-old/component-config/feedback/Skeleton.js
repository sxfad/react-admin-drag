import {fixDragProps} from 'src/pages/drag-page-old/util';

export default {
    isContainer: false,
    withDragProps: false,
    hooks: {
        afterRender: fixDragProps,
    },
    fields: [],
};
