import { defineStore } from "pinia";
import { getToken, removeToken, setToken } from "../utils/token-utils";
import type { UserInfoState } from "./interface";
import { ElMessage } from "element-plus";
import { staticRoutes } from "@/router/routes";
import { login, getUserInfo } from "@/api/user";

/**
 * 用户信息
 * @methods setUserInfos 设置用户信息
 */
export const useUserInfoStore = defineStore("userInfo", {
  // user 仓库中存放的数据
  state: (): any => ({
    // 登录成功后的用户 token
    token: getToken() as string,
    // 登录成功后的用户名
    name: "",
    // 登录成功后的用户头像
    avatar: "",
    // 不同角色的用户将要显示的管理菜单
    menuRoutes: staticRoutes,
  }),

  actions: {
    // 用户登录
    async login(username: string, password: string) {
      //   return new Promise((resolve, reject) => {
      //       setTimeout(() => {
      //           if (username === 'admin' && password === '111111') {
      //               const token = 'token-atguigu'
      //               setToken(token)
      //               this.token = token
      //               resolve(token)
      //           } else {
      //               // 给程序使用
      //               reject(new Error('用户名或密码错误!'))
      //               // 提示用户看的
      //               ElMessage.error('用户名或密码错误!')
      //           }
      //       }, 1000)
      //   })

      try {
        const res = await login(username, password);
        // console.log(res);
        // 把用户登录成功后的 token 保存到 localStorage 中（持久化）
        setToken(res.token);
        // 存储 token 到 pinia
        this.token = res.token;
      } catch (e) {
        ElMessage.error("用户名或密码错误!");
        throw new Error("用户名或密码错误!");
      }
    },

    async getInfo() {
      // return new Promise((resolve, reject) => {
      // setTimeout(() => {
      //     this.name = 'admin'
      //     this.avatar = 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'
      //     this.menuRoutes = staticRoutes
      //     resolve({name: this.name, avatar: this.avatar, token: this.token})
      // }, 1000)
      // })

      try {
        const res = await getUserInfo();
        // 把获取到用户名称和头像保存到pinia
        this.name = res.name;
        this.avatar = res.avatar;
      } catch (e) {
        throw new Error("出错了");
      }
    },

    reset() {
      // 删除local中保存的token
      removeToken();
      // 提交重置用户信息的mutation
      this.token = "";
      this.name = "";
      this.avatar = "";
    },
  },
});
