/*
 * @Author: 侯志伟
 * @Date: 2018-11-13 16:05:57
 * @Last Modified by: hou
 * @Last Modified time: 2020-07-04 15:49:19
 */
import config from './config/Haxios.config'
import axios from 'axios'
class HttpRequest {
  /**
     * @param param 转换成formdata的对象
     * @returns 创建formData数据
     */
  changeFormdata(param) {
    const formData = new FormData()
    for (var key in param) {
      if (!Array.isArray(param[key])) {
        formData.append(key, param[key])
      } else {
        param[key].map(item => {
          formData.append(key, item)
        })
      }
    }
    return formData
  }

  /**
     * @param param 转换成form表单序列数据
     * @returns 表单序列数据
     */
  serializeForm(param) {
    const data = []
    for (var key in param) {
      data.push(`${encodeURIComponent(key)}=${encodeURIComponent(typeof param[key] === 'object' ? JSON.stringify(param[key]) : param[key])}`)
    }
    return data.join('&')
  }

  /**
     * @param {instance} 请求实例
     */
  setIntercept(instance) {
    let loading = false
    /** 请求拦截 */
    instance.interceptors.request.use(
      http => {
        /** 当前url是否被拦截加载动画 */
        const has = config.loadingIntercept.some(i => {
          return i && http.url.includes(i)
        })
        /** 拦截loading */
        if (!has && 'loadAnimation' in config && typeof config.loadAnimation === 'function') {
          loading = config.loadAnimation()
        }
        /** 参数配置 */
        if ('beforeSetting' in config && typeof config.beforeSetting === 'function') {
          config.beforeSetting(http)
        }
        return http
      },
      error => {
        return Promise.reject(error)
      }
    )
    /** 响应拦截 */
    instance.interceptors.response.use(
      respones => {
        loading && 'loadingClose' in config && typeof config.loadingClose === 'function' ? config.loadingClose(loading) : null
        if (respones.status !== 200) {
          return Promise.reject(`出现一个预期之外的异常,错误代码：${respones.status}`)
        }
        if (respones.config.responseType === 'blob') {
          return respones
        }
        if ('notIntercept' in config && config.notIntercept.some(item => { return respones.config.url.includes(item) })) {
          return respones.data
        }
        /** 请求失败后 */
        if (respones.data[config.stateKey] !== config.realCode) {
          let handleBack = false
          'failureHandle' in config && typeof config.failureHandle === 'function' ? handleBack = config.failureHandle(respones.data) : null
          /** 不处理handleBack为true的后续 */
          if (handleBack) {
            return Promise.reject(respones.data)
          }
          /** 报错提示拦截 */
          const ismsg = config.repMsgIntercept.some(i => {
            return i && respones.config.url.includes(i)
          })
          if (ismsg) {
            return Promise.reject(respones.data)
          }
          /** 消息提示 */
          'failureMsg' in config && typeof config.failureMsg === 'function' ? config.failureMsg(respones.data) : null
          return Promise.reject(respones.data)
        }
        /** 正常请求 */
        return config.dataKey ? respones.data[config.dataKey] : respones.data
      },
      error => {
        loading && 'loadingClose' in config && typeof config.loadingClose === 'function' ? config.loadingClose(loading) : null
        if (error && error.response) {
          switch (error.response.status) {
            case 400:
              error.response.msg = '客户端异常'
              break
            case 401:
              error.response.msg = '登录过期'
              break
            case 403:
              error.response.msg = '服务器拒绝访问'
              break
            case 404:
              error.response.msg = '未找到服务地址'
              break
            case 408:
              error.response.msg = '访问超时'
              break
            case 500:
              error.response.msg = '访问服务器失败'
              break
            case 501:
              error.response.msg = '服务器不可用'
              break
            case 502:
              error.response.msg = '服务不可用'
              break
            case 503:
              error.response.msg = '无效请求'
              break
            case 504:
              error.response.msg = '网关超时'
              break
            case 505:
              error.response.msg = '客户端暂不支持该连接'
              break
            default:
              error.response.msg = `请求出错错误代码：${error.response.status}`
              break
          }
          'errorHandle' in config && typeof config.errorHandle === 'function' ? config.errorHandle({ status: error.response.status, message: error.response.msg || '服务器连接出错' }) : null
          return Promise.reject(error.response.msg)
        }
        'errorHandle' in config && typeof config.errorHandle === 'function' ? config.errorHandle({ status: 500, message: '服务器连接出错' }) : null
        /** 断网或连接不到服务器 */
        return Promise.reject('服务器连接出错')
      }
    )
  }

  /**
     * @param {context} 自定义axios参数
     * @param {method} 默认指定的请求类型
     * @param {type} 请求数据编码格式json/www-form-urlencoded/form-data
     * @param {resultType} 响应类型
     * @param {timeout} 响应超时时长
     * @param {baseURL} 请求前缀 或者域名
     * @returns {Promise}
     */
  request(context, method, type, responseType) {
    if (typeof context !== 'object' && !Array.isArray(context) && !context.url) {
      // eslint-disable-next-line no-console
      console.error('Api接口参数必须为对象,且url不能为空')
      return
    }
    /** 创建请求实例 */
    let xhr = null
    xhr = xhr || axios.create()
    xhr.defaults.timeout = context.timeout || config['timeout'] || 30000
    xhr.defaults.baseURL = context.baseUrl || config['baseUrl']
    /** 设置拦截器 */
    this.setIntercept(xhr)
    /** 基础请求配置生成 */
    const apiConfig = {
      method: method || 'get',
      responseType: responseType || ''
    }
    context = Object.assign(apiConfig, context)
    /** 数据编码处理 */
    if (type === 'FORM') {
      'headers' in context ? context.headers['Content-Type'] = 'application/x-www-form-urlencoded' : context.headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
      context.data = typeof context.data === 'object' ? this.serializeForm(context.data) : context.data
    }
    if (type === 'FORMDATA') {
      'headers' in context ? context.headers['Content-Type'] = 'multipart/form-data' : context.headers = {
        'Content-Type': 'multipart/form-data'
      }
      context.data = this.changeFormdata(context.data)
    }
    /** 执行请求 */
    return xhr(Object.assign(apiConfig, context))
  }

  /** application/json 提交常规json数据 */
  postApi(obj) { return this.request(obj, 'POST', 'JSON') }

  /** application/x-www-form-urlencoded 提交常规表单数据 */
  postFormApi(obj) { return this.request(obj, 'POST', 'FORM') }

  /** multipart/form-data 提交表单数据，可上传图片 */
  postFormDataApi(obj) { return this.request(obj, 'POST', 'FORMDATA') }

  /** json数据的put请求 */
  putApi(obj) { return this.request(obj, 'PUT', 'JSON') }

  /** 常规表单的put请求 */
  putFormApi(obj) { return this.request(obj, 'PUT', 'FORM') }

  /** formdata编码的put请求 */
  putFormDataApi(obj) { return this.request(obj, 'PUT', 'FORMDATA') }

  /** get请求 */
  getApi(obj) { return this.request(obj, 'GET', 'JSON') }

  /** DELETE请求 */
  delApi(obj) { return this.request(obj, 'DELETE', 'JSON') }

  /** 上传文件-支持多文件传输 */
  upFiles(obj) { return this.postFormDataApi(obj) }

  /** 上传文件-支持多文件传输 */
  putFiles(obj) { return this.putFormDataApi(obj) }
}
export default new HttpRequest()
