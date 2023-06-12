<template>
  <div>
    <el-button
      type="primary"
      icon="ele-Plus"
      :disabled="category3Id === ''"
      @click="changeViewHandler('spuFormView')"
      >添加 SPU</el-button
    >

    <el-table style="margin-top: 20px" :data="spuData">
      <el-table-column type="index" label="序号" width="80"></el-table-column>

      <el-table-column
        label="SPU名称"
        prop="spuName"
        width="180"
      ></el-table-column>

      <el-table-column label="SPU描述" prop="description"></el-table-column>

      <el-table-column label="操作" width="280">
        <template v-slot="{ row }">
          <el-button
            type="success"
            icon="ele-Plus"
            title="添加sku"
            @click="changeViewHandler('skuFormView', row)"
          ></el-button>
          <el-button
            type="warning"
            icon="ele-Edit"
            title="修改spu"
            @click="changeViewHandler('spuFormView', row)"
          ></el-button>
          <el-button
            type="info"
            icon="ele-InfoFilled"
            title="查看sku列表"
            @click="showSKUListHandler(row)"
          ></el-button>

          <el-popconfirm
            title="你确定要删除吗？"
            @confirm="deleteConfirmHandler(row.id)"
          >
            <template #reference>
              <el-button
                type="danger"
                icon="ele-Delete"
                title="删除spu"
              ></el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="margin-top: 20px"
      :total="total"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[5, 10, 15]"
      layout="prev,pager,next,jumper,->,sizes,total"
      @current-change="currentChangeHandler"
      @size-change="currentChangeHandler"
    ></el-pagination>

    <el-dialog v-model="isShowSKUDialog" :title="skuDialogTitle">
      <el-table :data="skuData" v-loading="loading">
        <el-table-column label="名称" prop="skuName"></el-table-column>
        <el-table-column label="价格" prop="price"></el-table-column>
        <el-table-column label="重量" prop="weight"></el-table-column>
        <el-table-column label="默认图片">
          <template v-slot="{ row }">
            <img :src="row.skuDefaultImg" style="width: 100px" />
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script lang="ts">
export default {
  name: "spuListView",
};
</script>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useAttrStore } from "@/stores/category";
import { storeToRefs } from "pinia";
import api from "@/api/spu";

import type { ISKU } from "@/api/sku";
import type { ISPU } from "@/api/spu";
import { ElMessage } from "element-plus";

// 从仓库中获取 category3Id
const attrStore = useAttrStore();
const { category3Id } = storeToRefs(attrStore);

// 列表

// 存储当前 category3Id 对应的数据
const spuData = ref<ISPU[]>();
const currentPage = ref(1);
const pageSize = ref(5);
const total = ref(0);

// 获取当前 category3Id 对应的 SPU 数据
async function getSPUData() {
  console.log(category3Id.value);
  if (category3Id.value !== "") {
    const res = await api.getList(
      Number(category3Id.value),
      currentPage.value,
      pageSize.value
    );

    spuData.value = res.records;

    currentPage.value = res.current;
    pageSize.value = res.size;
    total.value = res.total;
  }
}

// 当当前页被改变的时候
const currentChangeHandler = () => {
  // 因为当我们改变每页显示条数，当改变后的当前页小于总页码的时候，该请求我们不需要发送
  const pages = Math.ceil(total.value / pageSize.value);
  //   console.log("当前页/总页数", currentPage.value, pages);

  if (currentPage.value <= pages) {
    getSPUData();
  }
};

watch(category3Id, getSPUData, {
  immediate: true,
});

// 查看指定的 spu 下的 sku 信息
const skuData = ref<ISKU[]>([]);
const isShowSKUDialog = ref(false);
const skuDialogTitle = ref("");
const loading = ref(true);
const showSKUListHandler = async (data: ISPU) => {
  try {
    // 请求之前把 loading 设置为 true
    loading.value = true;
    skuData.value = await api.getSkuList(data.id);
    // 请求完成之后把 loading 设置为 false
    loading.value = false;
    skuDialogTitle.value = data.spuName + " 的SKU列表";
    isShowSKUDialog.value = true;
  } catch (e) {
    ElMessage.error("获取sku列表失败");
  }
};

// 删除
const deleteConfirmHandler = async (id: number) => {
  // console.log(id);
  try {
    await api.delete(Number(id));
    ElMessage.success("删除成功");

    // 重新获取数据
    await getSPUData();
  } catch (e) {
    ElMessage.error("删除失败");
  }
};

const emits = defineEmits(["changeView"]);
// const props = defineProps(["on-change"]);
// 添加spu的按钮被点击的时候
const changeViewHandler = (target = "spuFormView", row?: ISPU) => {
  // 向父级传递数据（告诉我要切换到spu的添加视图）
  emits("changeView", target, row);
  // props["on-change"]("supFormView");
};
</script>
