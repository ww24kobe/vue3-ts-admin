<template>
  <div>
    <el-card>
      <CategorySelector
        :disabled="showViewName !== 'spuListView'"
      ></CategorySelector>
    </el-card>

    <el-card style="margin-top: 20px">
      <spuListView
        v-if="showViewName === 'spuListView'"
        @change-view="changeView"
        :on-change="changeView"
        ref="listRef"
      ></spuListView>
      <spuFormView
        v-if="showViewName === 'spuFormView'"
        @change-view="changeView"
        :data="spuData"
      ></spuFormView>
      <skuFormView
        v-if="showViewName === 'skuFormView' && spuData"
        @change-view="changeView"
        :data="spuData"
      ></skuFormView>

      <!-- <component :is="showViewComponent"></component> -->
    </el-card>
  </div>
</template>

<script lang="ts">
export default {
  name: "ProductSpu",
};
</script>

<script lang="ts" setup>
import spuListView from "./spuListView.vue";
import spuFormView from "./spuFormView.vue";
import skuFormView from "./skuFormView.vue";

import { ref, onMounted } from "vue";

import type { ISPU } from "@/api/spu";

// 切换视图的类型变量
type viewType = "spuListView" | "spuFormView" | "skuFormView";
const showViewName = ref<viewType>("spuListView");

// 也是配合 component 内置组件来完成切换
// const showViewComponent = ref(spuFormView);

// 根据传入的 viewType 来切换显示不同的视图
const spuData = ref<ISPU>();
function changeView(viewName: viewType, data?: ISPU) {
  showViewName.value = viewName;
  // 把这个数据传递给 spuFormView 组件
  // console.log(data);
  spuData.value = data;
}

const listRef = ref();

onMounted(() => {
  console.log(listRef.value);
});
</script>
