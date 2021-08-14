import { ModalContent } from '@ra-lib/admin';
import { Button } from 'antd';
import ReactMarkdown from 'react-markdown';
import config from 'src/commons/config-hoc';
import { isMac } from 'src/pages/drag-page/util';

const markdown = `
# 帮助文档

## 快捷键

1. 「ctrl + f」 组件库中查找组件
1. 「ctrl + click」 选中节点，再次取消选中
1. 「space + 拖拽」 移动画布

1. 选中节点：
    1. 「ctrl + d」 删除选中节点
    1. 「ctrl + c」 复制选中节点
    1. 「ctrl + v」 选中节点之后插入剪切板中的节点或**图片**

1. 拖拽中：
    1. 「ctrl」 包裹目标节点
    1. 「alt」 设置目标节点属性
    1. 「shift」 替换目标节点

`.replaceAll('ctrl', isMac ? '⌘' : 'ctrl');


export default config({
    modal: '帮助',
})(function Help(props) {
    const { onCancel } = props;
    return (
        <ModalContent
            onCancel={onCancel}
            footer={<Button type="primary" onClick={onCancel}>我知道了</Button>}
        >

            <ReactMarkdown>
                {markdown}
            </ReactMarkdown>
        </ModalContent>
    );
});
