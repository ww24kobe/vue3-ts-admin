import { defineConfig, loadEnv, type ConfigEnv } from "vite";
import { resolve } from "path";

import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

// https://vitejs.dev/config/
export default defineConfig((mode: ConfigEnv) => {
  const env = loadEnv(mode.mode, process.cwd());
  return {
    // mode 接收两个值：development、production
    // development：开发，npm run dev 这个mode 使用的 development，vite 会为 开发环境配置对应策略
    // production：生产，npm run build 这个 mode 使用的事就是 production
    // 当我们运行 vite 命令的时候，会自动加载根目录下已 .env 开头的文件
    // mode: "development",
    plugins: [vue(), vueJsx()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
      extensions: [".ts", ".vue", ".js", ".jsx", ".tsx"], // 导入时想要省略的扩展名列表。
    },
    css: {
      preprocessorOptions: {
        scss: {
          // 引入 var.scss 这样就可以在全局中使用 var.scss中预定义的变量了
          // 给导入的路径最后加上 ;
          additionalData: '@import "./src/styles/variables.scss";',
        },
      },
      postcss: {
        plugins: [
          {
            postcssPlugin: "internal:charset-removal",
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === "charset") {
                  atRule.remove();
                }
              },
            },
          },
        ],
      },
    },

    // 配置请求代理
    server: {
      proxy: {
        /**
         * 原始请求
         * http://localhost:3001/app-dev/admin/acl/index/login
         * 因为本地服务器压根就没有这个接口，我们应该是发送到下面的真实地址
         * http://gmall-h5-api.atguigu.cn/admin/acl/index/login
         * 但是axios如果直接填写真实地址就会跨域了
         * 所以这里使用 server.proxy 来进行代理转发
         *
         * 转发就需要配置转发的规则
         * target：使用target设置的域名替换原始请求中的域
         *    http://gmall-h5-api.atguigu.cn/app-dev/admin/acl/index/login
         * rewrite: 对路径部分进行重写
         *    path 表示的就是原始路径中的path（/app-dev/admin/acl/index/login）, 使用 path.replace 把 /app-dev 替换成一个 ''
         *      http://gmall-h5-api.atguigu.cn/admin/acl/index/login
         */
        "/app-dev": {
          target: "http://gmall-h5-api.atguigu.cn",
          // pathRewrite: {
          //   '^/app-dev': ''
          // },
          // vite => rewrite
          rewrite: (path) => path.replace(/^\/app-dev/, ""),
          changeOrigin: true,
        },
      },
    },
  };
});
