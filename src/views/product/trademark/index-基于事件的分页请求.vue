<template>
  <div>
    <el-card shadow="hover">
      <template #header>
        <el-button type="primary" :icon="Plus">添加</el-button>
      </template>

      <div>
        <el-table :data="trademarks">
          <el-table-column label="序号" prop="id" width="150"></el-table-column>
          <el-table-column label="品牌名称" prop="tmName"></el-table-column>
          <!-- 通过 prop 设置的值，只能以字符串的形式展示，如果想在单元格中显示更丰富的内容，则需要使用 插槽来完成 -->
          <el-table-column label="品牌LOGO" width="220">
            <template v-slot="{ row }">
              <!-- 设置图片的高度，建议不要同时设置宽高，以免图片变形 -->
              <img :src="row.logoUrl" style="width: 100px" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template v-slot="row">
              {{ row.id }}
              <el-button type="warning" :icon="Edit">修改</el-button>
              <el-button type="danger" :icon="Delete">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-pagination
        :total="total"
        :page-size="pageSize"
        v-model:current-page="currentPage"
        @current-change="currentChangeHandler"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script lang="ts">
export default {
  name: "ProductTrademark",
};
</script>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { Plus, Edit, Delete } from "@element-plus/icons-vue";
import { getTradeMarks } from "@/api/trademark";

import type { ITrademark } from "@/types/app";

// const testData = ref([
//   { id: 1, name: "aaaaa" },
//   { id: 2, name: "bbb" },
//   { id: 3, name: "ccccccc" },
// ]);

//************ 列表 ******************/
// 定义一个变量用来接收当前页面的品牌列表数据
let trademarks = reactive<ITrademark[]>([]);

// 当前页
let currentPage = ref(1);

// 每页显示的条数
let pageSize = ref(5);

// 总数
let total = ref(0);

// mounted: () => {
//   console.log("onMounted");
// }
onMounted(async () => {
  console.log("onMounted");

  getTradeMarksData();
});

// 点击分页的时候触发
const currentChangeHandler = () => {
  // console.log(currentPage);
  getTradeMarksData();
};

// 发送请求列表的方法
const getTradeMarksData = async () => {
  const res = await getTradeMarks(currentPage.value, pageSize.value);

  trademarks = Object.assign(trademarks, res.records);

  // console.log(trademarks);

  currentPage.value = res.current;
  pageSize.value = res.size;
  total.value = res.total;
};
</script>
