import { createApp } from "vue";
// 加载 store
import pinia from "./stores";
// 加载 element
import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "element-plus/dist/index.css";
import ElSvg from "./components/SvgIcon/ElSvg";

// 导入自定义的分类组件
import CategorySelector from '@/components/CategorySelector/index.vue';

// 加载根组件
import App from "./App.vue";

// 加载路由配置
import router from "./router";

// 全局样式
import "./styles/index.scss";

// 加载鉴权逻辑，注册 beforeEach 函数，不会现在执行
import "./permission";

const app = createApp(App);

ElSvg(app);

// 注册全局组件
// 第一个参数：组件的名称
// 第二个参数：组件对象
// vue2 中注册全局组件的方法：Vue.component()
app.component('CategorySelector', CategorySelector);

app
  .use(pinia)
  .use(router)
  .use(ElementPlus, {
    locale: zhCn,
  })
  .mount("#app");
