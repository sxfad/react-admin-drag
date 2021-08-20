const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: {
        vendor: [
            'axios',
            'axios-mock-adapter',
            'classnames',
            'moment',
            'nprogress',
            'redux',
            'uuid',
            'lodash',
            'qs',
            'react',
            'react-router',
            'react-dom',
            'react-helmet',
            'react-redux',
            'react-router-dom',
            'react-sortable-hoc',
            'redux-thunk',
            'prop-types',
            '@loadable/component',
            'antd',
            '@ant-design/icons',
            'prettier',
            'qiankun',
            '@monaco-editor/react',
            // 'react-monaco-editor', // 无法使用
        ],
    },
    // devtool: '#source-map',
    output: {
        path: path.join(__dirname, 'dll'),
        filename: '[name]_[hash].dll.js',
        library: '[name]_[hash]',
        libraryTarget: 'window',
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.join(__dirname, 'dll', '[name]-manifest.json'),
            name: '[name]_[hash]',
        }),
    ],
};
