import config from 'src/commons/config-hoc';

export default config({
    path: '/test',
})(function Test(props) {

    return (
        <iframe
            style={{ width: '100%', height: 400 }}
            title="123"
            src="/dev-ra-gen"
            frameBorder="0"
        />
    );
});
