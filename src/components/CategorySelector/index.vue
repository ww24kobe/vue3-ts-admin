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
  name: 'CategorySelector',
}
</script>

<script lang="ts" setup>
// 从仓库中导入数据
import { useAttrStore } from '@/stores/category'
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import type { ICategory } from '@/types/app'

withDefaults(
  defineProps<{
    disabled: boolean
  }>(),
  {
    disabled: false,
  }
)

// 调用 useAttrStore 得到 attr 这个仓库的具体实例
const attrStore = useAttrStore()

const {
  category1Id,
  category2Id,
  category3Id,
  categories1,
  categories2,
  categories3,
} = storeToRefs(attrStore)

// 请求分类一的数据
attrStore.getCategories1()

const changeCategory1IdHandler = () => {
  attrStore.getCategories2()
}

const changeCategory2IdHandler = () => {
  attrStore.getCategories3()
}

const emits = defineEmits(['change-categoryId-3'])
const changeCategory3IdHandler = () => {
  emits('change-categoryId-3', category3Id.value)
}
</script>
