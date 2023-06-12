<template>
  <div>
    <!-- 
        inline 属性用于设置 el-form-item 的布局模式
            true：一行布局（横向布局）
            false：默认的，纵向布局
     -->
    <el-form inline :disabled="disabled">
      <el-form-item label="一级分类">
        <!-- 第一个分类结构 -->
        <!-- 使用 v-model 来绑定用户选中的值 -->
        <el-select
          placeholder="请选择"
          v-model="category1Id"
          @change="changeCategory1IdHandler"
        >
          <!-- 
                el-option 必须传入一个 value 属性

                value 属性一般是在代码中获取使用，或者传给后端
                label 属性是用来设置该选项显示给用户看到的内容，默认 label 与 value 相同，但是也可以单独设置
             -->
          <!-- <el-option value="1" label="男"></el-option>
            <el-option value="0" label="女"></el-option> -->

          <el-option
            v-for="category1 of categories1"
            :key="category1.id"
            :value="category1.id"
            :label="category1.name"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="二级分类">
        <el-select
          placeholder="请选择"
          v-model="category2Id"
          @change="changeCategory2IdHandler"
        >
          <el-option
            v-for="category2 of categories2"
            :key="category2.id"
            :value="category2.id"
            :label="category2.name"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="三级分类">
        <el-select
          placeholder="请选择"
          v-model="category3Id"
          @change="changeCategory3IdHandler"
        >
          <el-option
            v-for="category3 of categories3"
            :key="category3.id"
            :value="category3.id"
            :label="category3.name"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
export default {
  name: "CategorySelector",
};
</script>

<script lang="ts" setup>
// 从仓库中导入数据
import { useAttrStore } from "@/stores/category";
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";

import type { ICategory } from "@/types/app";

// 接收一个参数，用来控制表单的禁用状态
// 使用 ts 还是使用 js 来做props验证，只能二选一
// defineProps<{
//   // 不能在这里设置默认值，因为这是ts的类型声明
//   disabled: boolean;
// }>({
//   // 这个写法是 vue 提供的props验证写法，属于js
//   disabled: {
//     type: Boolean,
//     default: false,
//     required: true,
//   },
// });

// 使用 withDefaults 来定义和设置默认值，第一个参数使用 defineProps 来定义类型，第二个参数用来定义默认值
// https://cn.vuejs.org/api/sfc-script-setup.html#typescript-only-features
withDefaults(
  defineProps<{
    disabled: boolean;
  }>(),
  {
    disabled: false,
  }
);

// 调用 useAttrStore 得到 attr 这个仓库的具体实例
const attrStore = useAttrStore();

// const categories1 = ref<ICategory[]>();

// onMounted(async () => {
//   await attrStore.getCategories1();

//   categories1.value = attrStore.categories1;
// });

// 使用 storeToRefs 来从仓库中导出数据，并保持组件这个数据与仓库数据的同步
// 仓库对应的数据变化了，组件中解构出来的 categories1 也会改变
const {
  category1Id,
  category2Id,
  category3Id,
  categories1,
  categories2,
  categories3,
} = storeToRefs(attrStore);

// 请求分类一的数据
attrStore.getCategories1();

// 当分类一被选中的时候，发送请求获取分类二的数据
const changeCategory1IdHandler = () => {
  //   console.log(category1Id.value);
  attrStore.getCategories2();
};

// 当分类二被选中的时候，发送请求获取分类三的数据
const changeCategory2IdHandler = () => {
  //   console.log(category2Id.value);
  attrStore.getCategories3();
};

// 当分类三被选择的时候，组件内不做任何事情，只需要把选中的数据传递给父级
const emits = defineEmits(["change-categoryId-3"]);
const changeCategory3IdHandler = () => {
  // 不做任何额外事情，只是触发一个自定义的事件，通知父级去做事情，同时把选中的 分类三 的id传到父级
  emits("change-categoryId-3", category3Id.value);
};
</script>
