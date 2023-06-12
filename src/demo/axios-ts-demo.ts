import axios from "axios";

// 没有二次封装的情况
async function run() {
  // get 的类型申明格式
  // get<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;

  interface loginUser {
    success: boolean;
    code: number;
    message: string;
    data: {
      token: string;
    };
  }

  //   const res = await axios.get<loginUser>("/");

  const res = await axios.get<loginUser>("/");
  res.data.data.token;

  // res 其实就是 R 类型
  // 再次分析：R 其实就是 AxiosResponse<T>

  // 下面就是 AxiosResponse 的结构
  //   export interface AxiosResponse<T = any, D = any>  {
  //     data: T;
  //     status: number;
  //     statusText: string;
  //     headers: AxiosResponseHeaders;
  //     config: AxiosRequestConfig<D>;
  //     request?: any;
  //   }

  // 因为 data 中存储的是后端接口返回的数据，所以 data 中的数据类型 axios 不能指定，所以，把 data 格式的指定放到 泛型中定义
}

// 有二次封装的情况
async function run2() {
  axios.interceptors.response.use((res) => {
    // 直接返回的 res.data.data 导致后面get，post等方法得到的数据不在是原来的res了，而是 res.data.data
    return res.data.data;
  });

  //   interface loginUser {
  //     success: boolean;
  //     code: number;
  //     message: string;
  //     data: {
  //       token: string;
  //     };
  //   }

  interface loginUser {
    token: string;
  }

  //   const res = await axios.get<any, loginUser>("/");

  const res = (await axios.get("/")) as loginUser;
  res.token;
}
