<template>
  <div class="login-container">
    <!-- 
      el-form
        element-plus 提供的一个组件

        ref: 获取表单元素
        :model 绑定的数据
        :rules 验证规则
     -->
    <el-form
      ref="formRef"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      auto-complete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">尚品汇后台管理</h3>
      </div>

      <!-- el-form-item 中 porp 指定的值就是验证规则中的 key -->
      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon name="ele-UserFilled" />
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="Username"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon name="ele-Lock" />
        </span>
        <el-input
          :key="passwordType"
          ref="passwordRef"
          v-model="loginForm.password"
          :type="passwordType"
          placeholder="Password"
          name="password"
          tabindex="2"
          auto-complete="on"
          @keyup.enter="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon
            :name="passwordType === 'password' ? 'ele-Hide' : 'ele-View'"
          />
        </span>
      </el-form-item>

      <!--
        1、loading ： 当表单提交触发的时候，启用 loading 状态
        2、当按钮被点击的时候执行 handleLogin 从方法
      -->
      <el-button
        :loading="loading"
        type="primary"
        style="width: 100%; margin-bottom: 30px; height: 40px"
        @click.prevent="handleLogin"
        >登 陆</el-button
      >
    </el-form>
  </div>
</template>

<script lang="ts">
export default {
  name: "Login",
};
</script>

<script lang="ts" setup>
import { useUserInfoStore } from "@/stores/userInfo";
import type { FormInstance, FormRules } from "element-plus";
import { nextTick, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const userInfoStore = useUserInfoStore();
const route = useRoute();
const router = useRouter();

// 与表单input输入框绑定的数据
const loginForm = ref({
  username: "admin",
  password: "111111",
});

// 提交登录的 loading 状态
const loading = ref(false);

const passwordType = ref("password");
const redirect = ref("");
const passwordRef = ref<HTMLInputElement>();

// 创建了 ref 对象并与视图中的 el-form 进行了绑定
const formRef = ref<FormInstance>();

// 验证用户名是否合法
const validateUsername = (rule: any, value: any, callback: any) => {
  if (value.length < 4) {
    // 验证不通过，抛出一个 Error
    callback(new Error("用户名长度不能小于4位"));
  } else {
    // 验证通过
    callback();
  }
};
// 验证密码是否合法
const validatePassword = (rule: any, value: any, callback: any) => {
  // callback
  if (value.length < 6) {
    // 当调用 callback 的时候传入 Error 表示失败
    callback(new Error("密码长度不能小于6位"));
  } else {
    // 表示成功
    callback();
  }
};

// 登录表单的验证规则: el-form
/**
 export interface RuleItem {
    // 类型
    type?: RuleType;
    // 必填
    required?: boolean;
    // 正则
    pattern?: RegExp | string;
    最小值
    min?: number;
    // 最大值
    max?: number;
    // 长度
    len?: number;
    // 枚举 
    enum?: Array<string | number | boolean | null | undefined>;
    // 是否允许空格
    whitespace?: boolean;
    fields?: Record<string, Rule>;
    options?: ValidateOption;
    defaultField?: Rule;
    transform?: (value: Value) => Value;
    // 验证后的提示信息
    message?: string | ((a?: string) => string);
    asyncValidator?: (rule: InternalRuleItem, value: Value, callback: (error?: string | Error) => void, source: Values, options: ValidateOption) => void | Promise<void>;
    // 自定义验证规则
    validator?: (rule: InternalRuleItem, value: Value, callback: (error?: string | Error) => void, source: Values, options: ValidateOption) => SyncValidateResult | void;
}
 */

// enum STATUS {
//   SUCCESS: 200,
//   NOT_FOUND: 404
// }
//STATUS.SUCCESS=>200
//STATUS[200] = 'SUCCESS'

// if (res.statusCode === STATUS.SUCCESS) {

// } else if (res.statusCode === STATUS.NOT_FOUND) {

// }

const loginRules: FormRules = {
  // key 要验证的表单的属性
  // 因为每一套规则实际上是由多个规范组成的，这个数组中能填写的配置参考上面的 RuleItem
  username: [{ required: true, validator: validateUsername }],
  password: [{ required: true, trigger: "blur", validator: validatePassword }],
};

watch(
  route,
  () => {
    redirect.value = route.query && (route.query.redirect as string);
  },
  { immediate: true }
);

/* 
切换密码的显示/隐藏
*/
const showPwd = () => {
  if (passwordType.value === "password") {
    passwordType.value = "text";
  } else {
    passwordType.value = "password";
  }
  nextTick(() => {
    passwordRef.value?.focus();
  });
};

/* 
点击登陆的回调
*/
const handleLogin = async (e: Event) => {
  // e.preventDefault();
  // validate : 表单验证
  await formRef.value?.validate();
  // 开始启用 loading 提示
  loading.value = true;
  // // 从与表单输入框绑定的数据获取用户输入用户名和密码
  const { username, password } = loginForm.value;
  try {
    //   // 调用 userInfoStore 下封装的 login 方法实现登录
    await userInfoStore.login(username, password);
    router.push({ path: redirect.value || "/" });
  } finally {
    //   // finally: 无论是否有错误都执行的代码块
    loading.value = false;
  }
};
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}
/* reset element-ui css */
.login-container {
  background-image: url(../../assets/love.webp);
  background-color: #2d3a4b;
  background-size: cover;
  /* .login-container .el-input */
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;
    .el-input__wrapper {
      width: 100%;
      background-color: transparent;
      box-shadow: none;
      input {
        background: transparent;
        border: 0px;
        -webkit-appearance: none;
        border-radius: 0px;
        padding: 12px 5px 12px 15px;
        color: $light_gray;
        height: 47px;
        caret-color: $cursor;

        /* & 表示父级选择器 input:-webkit-autofill */
        &:-webkit-autofill {
          box-shadow: 0 0 0px 1000px $bg inset !important;
          -webkit-text-fill-color: $cursor !important;
        }
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 10px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
