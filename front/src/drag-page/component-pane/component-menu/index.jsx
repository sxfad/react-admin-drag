import React from 'react';
import Container from '../container';
import Header from '../header';
import Content from '../content';
import {ComingSoon} from 'src/drag-page/components';

function ComponentMenu(props) {
    const {icon, title} = props;

    return (
        <Container>
            <Header icon={icon} title={title}/>
            <Content>
                <ComingSoon/>
            </Content>
        </Container>
    );
}

export default React.memo(ComponentMenu);
