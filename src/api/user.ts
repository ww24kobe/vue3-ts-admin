import request from "@/utils/request";

// 如果我们要引入的是一个类型而不是一个值的时候，加上 type 前缀，告诉 ts，我们引入的是类型
import type { LoginUserResponseData, UserInfoData } from "@/types/app";

// function getUserInfo() {
// get<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
// {id: 1, name: 'zs'}
// 默认情况下 axios 返回的数据中的 data 格式可以通过第一个泛型参数类定义
// 因为我们响应拦截器中改变了默认的返回数据的结构，所以这里的类型声明就需要修改一下
// request.get<{id: number, name: string}>('/user').then((res) => {
//     // res.data.
// })

// 第一个泛型参数声明的是源数据中的 data 属性的格式
// request.get<any, {id: number, name: string}>('/user').then((res) => {
//     res.id
// })
// }

// function getData(): Promise<number> {
//     return new Promise((resolve) => {
//         resolve(1);
//     });
// }

// getData().then(d => {})

/**
 * 登录
 * @param username
 * @param password
 * @returns
 */
export async function login(username: string, password: string) {
  // 如果我们没有对 axios 进行二次封装，那么代码应该如下

  // let res = await request.post("/admin/acl/index/login", {
  //   username,
  //   password,
  // });
  // // res 的结构
  // res = {
  //   data: {},
  //   status: 0,
  //   statusText: 0,
  //   headers: 0,
  //   config: 0,
  //   request: 0,
  // };

  // res.data = {
  //   success: true,
  //   code: 20000,
  //   message: "成功",
  //   data: {
  //     token:
  //       "eyJhbGciOiJIUzUxMiIsInppcCI6IkdaSVAifQ.H4sIAAAAAAAAAKtWKi5NUrJSSkzJzcxT0lFKrShQsjI0MzextDAwMDGtBQAAr0uRIAAAAA.M57Egu5PefTEFn1F1juqUAD8fy1yOx4PAsdEWPO8beVjiQxS0zAZpgWiRv2qmT15UYjPZI898xQ7B2bu2C0duw",
  //   },
  // };

  // 根据分析，我们需要使用 res.data.data 才能得到我们想要的数据
  // res.data.data;

  // 但是现在我们进行了二次封装，在响应拦截器函数最后，返回了 res.data.data
  // 所以我们如果想要获取到 token，原来是 res.data.data.token
  // 现在是 res.token

  return request.post<any, LoginUserResponseData>("/admin/acl/index/login", {
    username,
    password,
  });
}

/**
 * 获取用户基础信息
 * @returns
 */
export function getUserInfo() {
  return request.get<any, UserInfoData>("/admin/acl/index/info");
}
