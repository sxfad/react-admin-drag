import React from 'react';
import {
    Form,
    InputNumber,
    Select,
    Row,
    Col,
} from 'antd';
import {Icon} from 'src/components';
import {RadioGroup, UnitInput, SliderInput, ColorInput} from 'src/drag-page/components';
import s from './style.less';


const textAlignOptions = [
    {value: 'left', label: '左对齐', icon: <Icon type="icon-align-left"/>},
    {value: 'center', label: '居中对齐', icon: <Icon type="icon-align-center"/>},
    {value: 'right', label: '右对齐', icon: <Icon type="icon-align-right"/>},
    {value: 'justify', label: '两端对齐', icon: <Icon type="icon-align-justify"/>},
];
const labelCol = {flex: '38px'};

const Font = React.memo(function Font(props) {
    return (
        <div className={s.root}>
            <Row>
                <Col span={14}>
                    <Form.Item
                        label="字符"
                        name="fontWeight"
                        labelCol={labelCol}
                        colon={false}
                    >
                        <Select
                            placeholder="粗细"
                            options={[
                                {value: 'normal', label: '正常'},
                                {value: 'bolder', label: '粗体'},
                                {value: '100', label: '细体'},
                            ]}
                        />
                    </Form.Item>
                </Col>
                <Col span={10} style={{paddingLeft: 8}}>
                    <Form.Item
                        name="fontSize"
                        colon={false}
                    >
                        <InputNumber
                            style={{width: '100%'}}
                            min={12}
                            step={1}
                            placeholder="字号 font-size"
                            formatter={value => value ? `${value}px` : value}
                            parser={value => value.replace('px', '')}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={14} style={{paddingLeft: labelCol.flex}}>
                    <Form.Item
                        name="color"
                        colon={false}
                    >
                        <ColorInput placeholder="颜色 color"/>
                    </Form.Item>
                </Col>
                <Col span={10} style={{paddingLeft: 8}}>
                    <Form.Item
                        name="lineHeight"
                        colon={false}
                    >
                        <UnitInput placeholder="行距 line-height"/>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item
                labelCol={labelCol}
                label="对齐"
                name="textAlign"
                colon={false}
            >
                <RadioGroup options={textAlignOptions}/>
            </Form.Item>
            <Form.Item
                labelCol={labelCol}
                label="透明"
                name="opacity"
                initialValue={1}
                colon={false}
            >
                <SliderInput suffix="%" percent/>
            </Form.Item>
        </div>
    );
});

export default Font;
