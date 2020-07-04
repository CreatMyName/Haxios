import Cookie from 'js-cookie'
export default {
  /** 请求全局url域名 */
  baseUrl: `http://domain.com`,
  /** 判断状态的 键 */
  stateKey: `code`,
  /** 唯一成功的状态值 */
  realCode: '0',
  /** 加载动画拦截器 写入接口地址则不加载动画 */
  loadingIntercept: [
    `/auth/login/captcha_img`,
    '/design/picture-group/update',
  ],
  /** 不按stateKey拦截方式拦截，自定义处理数据 */
  notIntercept: [`/auth/oauth/token`],
  /** 响应报错提示拦截器 写入接口地址则不报错 */
  repMsgIntercept: [],
  /** 请求执行前执行 */
  beforeSetting: config => {
    /** 可在请求前编辑请求内容， 比如附带令牌 */
    // Cookie.get('token') ? config.headers['Authorization'] = `Bearer ${Cookie.get('token')}` : null
  },
  /** 自定义加载动画 */
  loadAnimation: () => {
    /** 发送请求前执行的加载动画 */
    return true
  },
  /** 自定义加载动画关闭 */
  loadingClose: loading => {
    /** loading为 loadAnimation return出来的值*/
  },
  /** 自定义异常响应提示 */
  failureMsg: response => {
    /** 响应中 code 不为0的都会被拦截到此处统一处理 */
  },
  /** 自定义请求或响应错误处理 */
  errorHandle: err => {
     /** http响应的异常都拦截至此处处理 */
  }
}
