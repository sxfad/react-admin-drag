import Container from '../container';
import Header from '../header';
import Content from '../content';
import React from 'react';

function ComponentTree(props) {
    const { icon, title } = props;

    return (
        <Container>
            <Header icon={icon} title={title} />
            <Content>
                <div style={{ height: 1000, background: 'green' }}>11</div>
            </Content>
        </Container>
    );
}

export default React.memo(ComponentTree);
