import Container from '../container';
import Header from '../header';
import Content from '../content';
import React from 'react';
import {ComingSoon} from 'src/drag-page/components';

function ComponentSetting(props) {
    const { icon, title } = props;

    return (
        <Container>
            <Header icon={icon} title={title} />
            <Content>
                <ComingSoon/>
            </Content>
        </Container>
    );
}

export default React.memo(ComponentSetting);
