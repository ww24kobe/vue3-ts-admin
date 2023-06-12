import axios, { type AxiosResponse } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import pinia from '@/stores/index'
import { useUserInfoStore } from '../stores/userInfo'

/* 定义response对象的data接口 */
interface ResponseData<T> {
  code: number
  data: T
  message: string
}

// 配置新建一个 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 50000,
})

// 添加请求拦截器
service.interceptors.request.use((config) => {
  config.headers = {
    token: useUserInfoStore(pinia).token,
  }

  return config
})

// 添加响应拦截器
service.interceptors.response.use(
  async (response: AxiosResponse<ResponseData<any>>) => {
    const res = response.data
    // 根据 code 判断后端返回的状态，具体看你们各自的后端说明
    if (res.code !== 20000 && res.code !== 200) {
      ElMessage({
        message:
          (typeof res.data == 'string' && res.data) || res.message || 'Error',
        type: 'error',
        duration: 5 * 1000,
      })

      // `token` 过期或者账号已在别处登录
      // 因为接口的变更，res.code === 20001 才是 token 有问题
      if (response.status === 401 || res.code === 20001) {
        const storeUserInfo = useUserInfoStore(pinia)
        await storeUserInfo.reset()
        ElMessageBox.alert('你已被登出，请重新登录', '提示', {})
          .then(() => {
            window.location.href = '/'
          })
          .catch(() => {})
      }
      return Promise.reject(service.interceptors.response)
    } else {
      return res.data
    }
  },
  (error) => {
    // 对响应错误做点什么
    if (error.message.indexOf('timeout') != -1) {
      ElMessage.error('网络超时')
    } else if (error.message == 'Network Error') {
      ElMessage.error('网络连接错误')
    } else {
      if (error.response.data) ElMessage.error(error.response.statusText)
      else ElMessage.error('接口路径找不到')
    }
    return Promise.reject(error)
  }
)

export default service
