import {getToken, Ajax, createAjaxHoc, createAjaxHooks} from '@ra-lib/admin';
import {AJAX_PREFIX, AJAX_TIMEOUT} from 'src/config';
import handleError from './handle-error';
import handleSuccess from './handle-success';

const token = getToken();

// 创建Ajax实例，设置默认值
const ajax = new Ajax({
    baseURL: AJAX_PREFIX,
    timeout: AJAX_TIMEOUT,
    headers: {'USER-TOKEN': token},
    onError: handleError,
    onSuccess: handleSuccess,
    // withCredentials: true, // 跨域携带cookie，对应后端 Access-Control-Allow-Origin不可以为 '*'，需要指定为具体域名
});

// 响应拦截
ajax.instance.interceptors.response.use(res => {
    // Do something before response

    // 后端自定义失败，前端直接抛出，走handleError逻辑
    // if (res.data.code !== 0) return Promise.reject(res.data);

    return res;
}, error => {
    // Do something with response error
    return Promise.reject(error);
});

// 请求拦截
ajax.instance.interceptors.request.use(cfg => {
    // Do something before request is sent
    return cfg;
}, error => {
    // Do something with request error
    return Promise.reject(error);
});

const hooks = createAjaxHooks(ajax);
const hoc = createAjaxHoc(ajax);

export default ajax;

export const ajaxHoc = hoc;

export const get = ajax.get;
export const post = ajax.post;
export const put = ajax.put;
export const del = ajax.del;
export const patch = ajax.patch;
export const download = ajax.download;

export const useGet = hooks.useGet;
export const usePost = hooks.usePost;
export const usePut = hooks.usePut;
export const useDel = hooks.useDel;
export const usePatch = hooks.usePatch;
export const useDownload = hooks.useDownload;

