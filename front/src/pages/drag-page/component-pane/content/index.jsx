import s from './style.less';

export default function Container(props) {
    const {className, children, ...others} = props;
    return (
        <div className={[s.root, className]} {...others}>
            {children}
        </div>
    );
}
