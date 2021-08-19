import React, {useCallback} from 'react';
import {Form, Input, Row, Col} from 'antd';
import {PicCenterOutlined} from '@ant-design/icons';
import {RadioGroup, UnitInput, QuickPosition, ColorInput} from 'src/pages/drag-page/components';
import s from './style.less';

const backgroundSizeOptions = [
    {value: 'width height', label: '宽高'},
    {value: 'contain', label: '等比填充'},
    {value: 'cover', label: '等比覆盖'},
];
const backgroundRepeatOptions = [
    {value: 'no-repeat', label: '不重复', icon: <PicCenterOutlined/>},
    {value: 'repeat', label: '垂直和水平重复', icon: <PicCenterOutlined/>},
    {value: 'repeat-x', label: '水平重复', icon: <PicCenterOutlined/>},
    {value: 'repeat-y', label: '垂直重复', icon: <PicCenterOutlined/>},
];
const quickPositionFields = {
    topLeft: {backgroundPositionX: 0, backgroundPositionY: 0},
    top: {backgroundPositionX: '50%', backgroundPositionY: 0},
    topRight: {backgroundPositionX: '100%', backgroundPositionY: 0},
    left: {backgroundPositionX: 0, backgroundPositionY: '50%'},
    center: {backgroundPositionX: '50%', backgroundPositionY: '50%'},
    right: {backgroundPositionX: '100%', backgroundPositionY: '50%'},
    bottomLeft: {backgroundPositionX: 0, backgroundPositionY: '100%'},
    bottom: {backgroundPositionX: '50%', backgroundPositionY: '100%'},
    bottomRight: {backgroundPositionX: '100%', backgroundPositionY: '100%'},

};
const layout = {
    labelCol: {flex: '68px'},
    wrapperCol: {flex: 1},
};
const Background = React.memo(function Background(props) {
    const {form} = props;

    const handleChange = useCallback(() => form.submit(), [form]);

    return (
        <div className={s.root}>
            <Form.Item
                {...layout}
                label="填充颜色"
                name="backgroundColor"
                colon={false}
            >
                <ColorInput
                    allowClear
                    placeholder="background-color"
                />
            </Form.Item>
            <Form.Item
                {...layout}
                label="背景图片"
                name="backgroundImage"
                colon={false}
            >
                <Input
                    allowClear
                    placeholder="background-image"
                />
            </Form.Item>
            <Form.Item shouldUpdate noStyle>
                {({getFieldValue}) => {
                    const backgroundImage = getFieldValue('backgroundImage');
                    if (!backgroundImage) return null;

                    return (
                        <>
                            <Form.Item
                                {...layout}
                                label="尺寸"
                                name="backgroundSize"
                                colon={false}
                            >
                                <RadioGroup options={backgroundSizeOptions}/>
                            </Form.Item>
                            <Form.Item shouldUpdate noStyle>
                                {({getFieldValue}) => {
                                    const backgroundSize = getFieldValue('backgroundSize');
                                    if (backgroundSize !== 'width height') return null;

                                    return (
                                        <Row className={s.backgroundSize} style={{paddingLeft: layout.labelCol.flex}}>
                                            <Col span={12}>
                                                <Form.Item
                                                    labelCol={{flex: 0}}
                                                    wrapperCol={{flex: 1}}
                                                    label="宽"
                                                    name="backgroundSizeWidth"
                                                    colon={false}
                                                >
                                                    <UnitInput placeholder="width"/>
                                                </Form.Item>
                                            </Col>
                                            <Col span={12} style={{paddingLeft: 8}}>
                                                <Form.Item
                                                    labelCol={{flex: 0}}
                                                    wrapperCol={{flex: 1}}
                                                    label="高"
                                                    name="backgroundSizeHeight"
                                                    colon={false}
                                                >
                                                    <UnitInput placeholder="height"/>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    );
                                }}
                            </Form.Item>
                            <Row>
                                <Col
                                    flex={layout.labelCol.flex}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        alignItems: 'center',
                                        paddingRight: 10,
                                    }}
                                >
                                    定位
                                </Col>
                                <Col
                                    flex={1}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'flex-start',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Row>
                                        <Col flex={0}>
                                            <QuickPosition
                                                type="rect"
                                                selectedKey={item => {
                                                    const {value} = item;
                                                    const fieldsValue = quickPositionFields[value];
                                                    const values = form.getFieldsValue();

                                                    if ((
                                                        fieldsValue.backgroundPositionX === values.backgroundPositionX
                                                        && fieldsValue.backgroundPositionY === values.backgroundPositionY
                                                    )) {
                                                        return value;
                                                    }
                                                }}
                                                onClick={item => {
                                                    const {value} = item;
                                                    const fieldsValue = quickPositionFields[value];

                                                    form.setFieldsValue(fieldsValue);

                                                    handleChange();
                                                }}/>
                                        </Col>
                                        <Col
                                            flex={1}
                                            style={{
                                                paddingLeft: 16,
                                                paddingTop: 4,
                                            }}
                                        >
                                            <Form.Item
                                                labelCol={{flex: 0}}
                                                wrapperCol={{flex: 1}}
                                                label="左"
                                                name="backgroundPositionX"
                                                colon={false}
                                            >
                                                <UnitInput placeholder="left" style={{width: 80}}/>
                                            </Form.Item>
                                            <Form.Item
                                                labelCol={{flex: 0}}
                                                wrapperCol={{flex: 1}}
                                                label="顶"
                                                name="backgroundPositionY"
                                                colon={false}
                                            >
                                                <UnitInput placeholder="top" style={{width: 80}}/>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Form.Item
                                {...layout}
                                label="重复方式"
                                name="backgroundRepeat"
                                colon={false}
                            >
                                <RadioGroup options={backgroundRepeatOptions}/>
                            </Form.Item>
                        </>
                    );
                }}
            </Form.Item>
        </div>
    );
});

// style 对象 转换为form数据
Background.styleToFormValues = (style) => {
    let {
        backgroundImage,
        backgroundSize,
        backgroundPosition,
    } = style;

    // 背景图转换
    if (backgroundImage) {
        let [, image = ''] = (/url\(([^)]+)\)/.exec(backgroundImage) || []);
        if (image.startsWith('\'') || image.startsWith('"')) {
            image = image.substring(1, image.length - 1);
        }
        style.backgroundImage = image;
    }
    // 大小转换
    if (backgroundSize) {
        const values = backgroundSize.trim().replace(/\s{2,}/g, ' ').split(' ');
        if (values.length === 2) {
            style.backgroundSizeWidth = values[0];
            style.backgroundSizeHeight = values[1];
            style.backgroundSize = 'width height';
        }
    }
    // 位置转换
    if (backgroundPosition) {
        const values = backgroundPosition.trim().replace(/\s{2,}/g, ' ').split(' ');
        if (values.length === 2) {
            style.backgroundPositionX = values[0];
            style.backgroundPositionY = values[1];
        }
    }

    return style;
};

// form中数据转换为style对象
Background.formValuesToStyle = (changedValues, allValues) => {
    let {
        backgroundImage,
        backgroundSize,
        backgroundSizeWidth = '',
        backgroundSizeHeight = '',
    } = allValues;

    if (backgroundImage) {
        allValues.backgroundImage = `url('${backgroundImage}')`;
    } else {
        const fieldsValue = {
            backgroundSize: undefined,
            backgroundPositionX: undefined,
            backgroundPositionY: undefined,
            backgroundRepeat: undefined,
        };
        Object.entries(fieldsValue).forEach(([key, value]) => {
            allValues[key] = value;
        });
    }

    if (backgroundSize === 'width height') {
        if (backgroundSizeWidth === '' && backgroundSizeHeight === '') {
            allValues.backgroundSize = undefined;
        } else {
            if (backgroundSizeWidth === '') backgroundSizeWidth = 'auto';
            if (backgroundSizeHeight === '') backgroundSizeHeight = 'auto';

            allValues.backgroundSize = `${backgroundSizeWidth} ${backgroundSizeHeight}`;
        }
    }

    return allValues;
};

export default Background;
