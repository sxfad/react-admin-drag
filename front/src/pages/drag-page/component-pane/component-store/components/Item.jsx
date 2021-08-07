import s from './style.less';

export default function ComponentItem(props) {
    const { data: { title, image } } = props;
    return (
        <div className={s.item}>
            {title}
            <div className={s.preview}>
                {image ? (
                    <img
                        draggable={false}
                        className={s.img}
                        src={image}
                        alt="组件预览图"
                    />
                ) : (
                    <span>渲染</span>
                )}
            </div>
        </div>
    );
}
