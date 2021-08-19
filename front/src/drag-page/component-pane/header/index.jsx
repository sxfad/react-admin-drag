import s from './style.less';

export default function Header(props) {

    const {title, icon, className, children, ...others} = props;
    return (
        <header className={[s.root, className]} {...others}>
            <div className={s.title}>
                <span className={s.icon}>{icon}</span>
                <span>{title}</span>
            </div>
            <div className={s.content}>
                {children}
            </div>
        </header>
    );
}
