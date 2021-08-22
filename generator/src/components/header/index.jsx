import {useState} from 'react';
import {Space, Dropdown, Menu, Avatar} from 'antd';
import {DownOutlined, LockOutlined, LogoutOutlined} from '@ant-design/icons';
import {getColor, FullScreen} from '@ra-lib/admin';
import {IS_MOBILE} from 'src/config';
import config from 'src/commons/config-hoc';
import {toLogin} from 'src/commons';

import PasswordModal from './PasswordModal';
import styles from './style.less';

export default config({
    router: true,
})(function Header(props) {
    const {loginUser = {}} = props;
    const [passwordVisible, setPasswordVisible] = useState(false);

    async function handleLogout() {
        await props.ajax.post('/logout');
        toLogin();
    }

    const menu = (
        <Menu>
            <Menu.Item key="modify-password" icon={<LockOutlined/>} onClick={() => setPasswordVisible(true)}>
                修改密码
            </Menu.Item>
            <Menu.Divider/>
            <Menu.Item key="logout" danger icon={<LogoutOutlined/>} onClick={handleLogout}>
                退出登录
            </Menu.Item>
        </Menu>
    );

    const {avatar, name = ''} = loginUser;

    const width = IS_MOBILE ? 'auto' : '200px';
    return (
        <Space
            className={styles.root}
            size={16}
            style={{
                // 两个宽度要同时设置，否则会被挤！！！
                flex: `0 0 ${width}`,
                width,
                paddingRight: IS_MOBILE ? 0 : 12,
            }}
        >
            {IS_MOBILE ? null : (
                <>
                    <div className={styles.action}>
                        <FullScreen/>
                    </div>
                </>
            )}

            <Dropdown overlay={menu}>
                <div className={styles.action}>
                    {avatar ? (
                        <Avatar size="small" className={styles.avatar} src={avatar}/>
                    ) : (
                        <Avatar
                            size="small"
                            className={styles.avatar}
                            style={{backgroundColor: getColor(name)}}
                        >
                            {(name[0] || '').toUpperCase()}
                        </Avatar>
                    )}
                    {IS_MOBILE ? null : (
                        <>
                            <span className={styles.userName}>{name}</span>
                            <DownOutlined/>
                        </>
                    )}
                </div>
            </Dropdown>
            <PasswordModal
                visible={passwordVisible}
                onCancel={() => setPasswordVisible(false)}
                onOk={() => setPasswordVisible(false)}
            />
        </Space>
    );
});
