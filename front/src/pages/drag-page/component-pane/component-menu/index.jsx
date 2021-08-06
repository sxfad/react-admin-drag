import Container from '../container';
import Header from '../header';
import Content from '../content';
import React from 'react';

export default function ComponentMenu(props) {
    const {icon, title} = props;

    return (
        <Container>
            <Header>
                {icon}
                {title}
            </Header>
            <Content>
                <div style={{height: 1000, background: 'gray'}}>11</div>
            </Content>
        </Container>
    );
}
