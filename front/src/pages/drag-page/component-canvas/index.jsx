import s from './style.less';

export default function ComponentCanvas(props) {

    return (
        <div className={s.root}>
            <div style={{height: 1000, background: 'yellowgreen'}}>center</div>
        </div>
    );
}
