import Container from '../container';
import Header from '../header';
import Content from '../content';
import React from 'react';
import {Input, Select} from 'antd';
import s from './style.less';

export default function ComponentStore(props) {
    const {icon, title} = props;

    return (
        <Container>
            <Header icon={icon} title={title}/>
            <div className={s.top}>
                <Input
                    allowClear
                    placeholder="请输入关键词搜索组件"
                />
                <Select
                    style={{width: '100%', marginTop: 4}}
                    placeholder="选择组件分类"
                />
            </div>

            <Content>
                <div style={{height: 2000, background: 'red'}}>22</div>
            </Content>
        </Container>
    );
}
