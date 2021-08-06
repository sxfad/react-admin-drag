import Container from '../container';
import Header from '../header';
import Content from '../content';
import React from 'react';

export default function ComponentSetting(props) {
    const {icon, title} = props;

    return (
        <Container>
            <Header icon={icon} title={title}/>
            <Content>
                <div style={{height: 1000, background: 'rebeccapurple'}}>11</div>
            </Content>
        </Container>
    );
}
