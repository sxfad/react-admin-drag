import ModalImage from './images/Modal.png';
import ModalConfirmImage from './images/ModalConfirm.png';
import ModalErrorImage from './images/ModalError.png';
import ModalInfoImage from './images/ModalInfo.png';
import ModalSuccessImage from './images/ModalSuccess.png';
import ModalWarningImage from './images/ModalWarning.png';
import NotificationImage from './images/Notification.png';
import MessageImage from './images/Message.png';
import PopconfirmImage from './images/Popconfirm.png';
import DrawerImage from './images/Drawer.png';

export default [
    {
        title: '警告提示',
        subTitle: 'Alert',
        children: [
            {
                title: '警告提示',
                renderPreview: true,
                config: {
                    componentName: 'Alert',
                    props: {
                        message: '提示标题',
                        description: '提示详细描述',
                    },
                },
            },
        ],
    },
    {
        title: '抽屉',
        subTitle: 'Drawer',
        children: [
            {
                title: '抽屉',
                renderPreview: false,
                image: DrawerImage,
                config: {
                    componentName: 'Drawer',
                    props: {
                        title: '抽屉标题',
                    },
                },
            },
        ],
    },
    {
        title: '全局提示',
        subTitle: 'Message',
        children: [
            {
                title: '成功全局提示',
                image: MessageImage,
                config: {
                    componentName: 'Message',
                    props: {
                        content: '操作成功',
                        type: 'success',
                    },
                },
            },
            {
                title: '错误全局提示',
                image: MessageImage,
                config: {
                    componentName: 'Message',
                    props: {
                        content: '操作失败',
                        type: 'error',
                    },
                },
            },
            {
                title: '信息全局提示',
                image: MessageImage,
                config: {
                    componentName: 'Message',
                    props: {
                        content: '信息提示',
                        type: 'info',
                    },
                },
            },
            {
                title: '警告全局提示',
                image: MessageImage,
                config: {
                    componentName: 'Message',
                    props: {
                        content: '警告',
                        type: 'warning',
                    },
                },
            },
        ],
    },
    {
        title: '弹框',
        subTitle: 'Modal',
        children: [
            {
                title: '弹框',
                image: ModalImage,
                config: {
                    componentName: 'Modal',
                    props: {
                        title: '弹框标题',
                        bodyStyle: {
                            padding: 0,
                        },
                    },
                    children: [
                        {
                            componentName: 'div',
                            props: {
                                style: {
                                    paddingTop: 16,
                                    paddingRight: 16,
                                    paddingBottom: 16,
                                    paddingLeft: 16,
                                },
                            },
                            children: [
                                {
                                    componentName: 'DragHolder',
                                    props: {
                                        style: { height: 200 },
                                    },
                                },
                            ],
                        },
                        // {
                        //     componentName: 'ModalFooter',
                        //     props: {
                        //         className: 'ant-modal-footer',
                        //     },
                        //     children: [
                        //         {
                        //             componentName: 'Button',
                        //             children: [
                        //                 {
                        //                     componentName: 'Text',
                        //                     props: {
                        //                         text: '取消',
                        //                         isDraggable: false,
                        //                     },
                        //                 },
                        //             ],
                        //         },
                        //         {
                        //             componentName: 'Button',
                        //             props: {
                        //                 type: 'primary',
                        //             },
                        //             children: [
                        //                 {
                        //                     componentName: 'Text',
                        //                     props: {
                        //                         text: '确定',
                        //                         isDraggable: false,
                        //                     },
                        //                 },
                        //             ],
                        //         },
                        //     ],
                        // },
                    ],
                },
            },
            {
                title: '弹框底部',
                renderPreview: true,
                previewProps: { style: { width: '100%' } },
                previewZoom: .68,
                config: {
                    componentName: 'ModalFooter',
                    props: {
                        className: 'ant-modal-footer customer-modal-footer',
                    },
                    children: [
                        {
                            componentName: 'Button',
                            children: [
                                {
                                    componentName: 'Text',
                                    props: {
                                        text: '取消',
                                        isDraggable: false,
                                    },
                                },
                            ],
                        },
                        {
                            componentName: 'Button',
                            props: {
                                type: 'primary',
                            },
                            children: [
                                {
                                    componentName: 'Text',
                                    props: {
                                        text: '确定',
                                        isDraggable: false,
                                    },
                                },
                            ],
                        },
                    ],
                },
            },
            {
                title: '确认提示框',
                image: ModalConfirmImage,
                config: {
                    componentName: 'ModalConfirm',
                    props: {
                        title: '温馨提示',
                        content: '您确定吗？',
                    },
                },
            },
            {
                title: '成功提示框',
                image: ModalSuccessImage,
                config: {
                    componentName: 'ModalSuccess',
                    props: {
                        title: '温馨提示',
                        content: '操作成功！',
                    },
                },
            },
            {
                title: '错误提示框',
                image: ModalErrorImage,
                config: {
                    componentName: 'ModalError',
                    props: {
                        title: '温馨提示',
                        content: '操作失败！',
                    },
                },
            },
            {
                title: '信息提示框',
                image: ModalInfoImage,
                config: {
                    componentName: 'ModalInfo',
                    props: {
                        title: '信息提示',
                        content: '这个是信息内容！',
                    },
                },
            },
            {
                title: '警告提示框',
                image: ModalWarningImage,
                config: {
                    componentName: 'ModalWarning',
                    props: {
                        title: '温馨提示',
                        content: '警告内容！',
                    },
                },
            },
        ],
    },
    {
        title: '通知提醒框',
        subTitle: 'Notification',
        children: [
            {
                title: '成功通知',
                image: NotificationImage,
                config: {
                    componentName: 'Notification',
                    props: {
                        message: '温馨提示',
                        description: '操作成功',
                        type: 'success',
                    },
                },
            },
            {
                title: '失败通知',
                image: NotificationImage,
                config: {
                    componentName: 'Notification',
                    props: {
                        message: '温馨提示',
                        description: '操作失败',
                        type: 'error',
                    },
                },
            },
            {
                title: '消息通知',
                image: NotificationImage,
                config: {
                    componentName: 'Notification',
                    props: {
                        message: '温馨提示',
                        description: '消息内容',
                        type: 'info',
                    },
                },
            },
            {
                title: '警告通知',
                image: NotificationImage,
                config: {
                    componentName: 'Notification',
                    props: {
                        message: '温馨提示',
                        description: '警告内容',
                        type: 'warning',
                    },
                },
            },
        ],
    },
    {
        title: '气泡确认框',
        subTitle: 'Popconfirm',
        children: [
            {
                title: '气泡确认框',
                renderPreview: true,
                // previewProps: {
                //     visible: true,
                //     getPopupContainer: e => e.parentNode,
                // },
                // previewWrapperStyle: {
                //     paddingTop: 120,
                // },
                image: PopconfirmImage,
                config: {
                    componentName: 'Popconfirm',
                    props: {
                        title: '您确定吗？',
                    },
                },
            },
        ],
    },
    {
        title: '进度条',
        subTitle: 'Progress',
        children: [
            {
                title: '进度条',
                renderPreview: true,
                config: {
                    componentName: 'Progress',
                    props: {
                        percent: 50,
                    },
                },
            },
        ],
    },
    {
        title: '结果',
        subTitle: 'Result',
        children: [
            {
                title: '结果',
                renderPreview: true,
                config: {
                    componentName: 'Result',
                },
            },
        ],
    },
    {
        title: '骨架屏',
        subTitle: 'Skeleton',
        children: [
            {
                title: '骨架屏',
                renderPreview: true,
                previewZoom: .7,
                config: {
                    componentName: 'Skeleton',
                },
            },
        ],
    },
    {
        title: '加载中',
        subTitle: 'Spin',
        children: [
            {
                title: '加载中',
                renderPreview: true,
                config: {
                    componentName: 'Spin',
                },
            },
        ],
    },
];
