### Haxios 是依赖axios的二次封装http请求插件，它能使你的请求代码编写更便捷，请求处理更快速

### Haxios 主要使用是在Haxios.config.js配置好baseUrl,stateKey,realCode,msgKey,dataKey这五个核心参数即可简单的使用了（更多配置在config/Haxios.config.js内有详细注释）
* baseUrl表示请求基本路径
* stateKey表示响应状态的key
* realCode表示响应状态的唯一成功的值
* msgKey表示响应内存在消息的key
* dataKey传入时写存放数据的key，promise接收到的就只有数据，不传时默认返回整个响应
#### 例如项目的响应信息结构如下
`  
{   
    code: 0,   
    message: '这是消息',   
    result: '这是请求数据'   
}   
`  
#### 响应表示仅code等于0时表示数据处理成功，若失败则需要报错处理，此时拦截器将把报错归于配置文件的failureMsg和errorHandle方法内统一处理
* failureMsg接受响应状态为200 但后端处理不成功时的异常
* errorHandle接受响应状态为200之外的请求异常

#### 如若部分接口不需要被拦截器处理数据可以将该接口写入notIntercept内

### Haxios实际是为了快速写接口而封装的，它遵循“ 请求方法 + 数据编码格式 + Api ”形成方法名称
#### 请求方法内的参数可以和axios完全一致，但是这样也失去了使用此插件的意义，因为插件已经通过方法名自动匹配了大多数的参数信息
#### 例如以下发送get请求：
`import http from 'Haxios'`  
`//举例get请求`  
`http.getApi({ url: 'get/request/api?key=value' }) 或者 http.getApi({ url: 'get/request/api', params: {} })`
#### 发送post请求 返回promise，但是数据已经 经过上述的拦截器处理了
`http.postApi({ url: 'post/request/api', data: {} }) //发送post请求，数据编码格式为 json`  
`//或者`  
`http.postFormApi({ url: 'post/form/api', data: {} }) //模拟表单发送数据请求，数据编码格式为 application/x-www-form-urlencoded`  
`//又或者`  
`http.postFormDataApi({ url: 'post/formdata/api', data: {} }) //发送表单数据，可以携带文件数据，数据编码格式为 multipart/form-data`
#### put请求的写法同post一致，只是吧post改成put即可  
#### delete请求则是吧get请求的get改成del即可，其它写法皆一致  
#### 为了方便根据方法名称记忆匹配，特别规范的写了upFiles和putFiles，它同上述的postFormDataApi或者putFormDataApi是一致的
#### 需要注意的是get和delete请求写的是pramas传参，post和put请求需要用data传参，data对象内的数据都会自动转换成需要的数据，所以不需要过多处理了丢给Haxios即可

### Haxios内提供有request方法可以直接越过命名规则直接自己匹配参数进去，但不建议
### Haxios内还提供有两个数据格式转换接口可以方便使用
* 1、changeFormdata 描述：可以将Object数据转换为FormData对象  
* 2、serializeForm 描述：可以将Object数据转换为表单序列化数据  id=123&name=myname  
* 3、setIntercept 描述：可以将axios创建的xhr对象加入一个Haxios的拦截器