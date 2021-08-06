import s from './style.less';

export default function Container(props) {
    const {className, children, ...others} = props;
    return (
        <main className={[s.root, className]} {...others}>
            {children}
        </main>
    );
}
