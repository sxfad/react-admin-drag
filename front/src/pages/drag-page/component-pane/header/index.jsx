import s from './style.less';

export default function Header(props) {

    const {className, children, ...others} = props;
    return (
        <header className={[s.root, className]} {...others}>
            {children}
        </header>
    );
}
