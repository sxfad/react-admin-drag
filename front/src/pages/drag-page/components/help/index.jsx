import {Button, Modal} from 'antd';
import {QuestionCircleOutlined} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import {isMac} from 'src/pages/drag-page/util';
import React from 'react';

const markdown = `
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


export default function Help(props) {
    const {onCancel, visible} = props;
    return (
        <Modal
            visible={visible}
            width={800}
            style={{top: 42}}
            title={<><QuestionCircleOutlined/> 帮助文档</>}
            onCancel={onCancel}
            footer={<Button type="primary" onClick={onCancel}>我知道了</Button>}
        >
            <ReactMarkdown>
                {markdown}
            </ReactMarkdown>
        </Modal>
    );
}
