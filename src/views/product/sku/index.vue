<template>
  <div>

<!--    <input v-bind="{type: 'text', value: 'abc'}">-->
<!--    <input v-bind:type="'text'" v-bind:value="'abc'">-->
<!--    <el-button v-bind:type="'primary'"></el-button>-->
<!--    <el-button v-bind="{type: 'info', icon: 'ele-Top'}"></el-button>-->

    <el-card shadow="hover">
      <el-table :data="skuData">
        <el-table-column label="序号" type="index" width="80"></el-table-column>
        <el-table-column label="名称" prop="skuName"></el-table-column>
        <el-table-column label="描述" prop="skuDesc"></el-table-column>
        <el-table-column label="默认图片">
          <template v-slot="{row}">
            <img :src="row.skuDefaultImg" style="width: 100px" />
          </template>
        </el-table-column>
        <el-table-column label="重量（kg）" prop="weight"></el-table-column>
        <el-table-column label="价格（元）" prop="price"></el-table-column>
        <el-table-column label="操作" width="300">
          <template v-slot="{row, $index}">
<!--            <el-button type="info" icon="ele-Bottom"></el-button>-->
            <!--
              v-bind 的知识点：可以不用通过 : 指定要绑定的属性，且值必须是一个对象，他的内部会自动的循环该对象，对象的key就是要绑定的属性，value就是该属性对应的值
            -->
            <el-button v-bind="btnAttrs[$index]" @click="changeSaleHandler(row)"></el-button>
            <el-button type="primary" icon="ele-Edit" @click="editHandler"></el-button>
            <el-button type="info" icon="ele-InfoFilled" @click="showDetailHandler(row.id)"></el-button>
            <el-button type="danger" icon="ele-Delete" @click="deleteHandler(row.id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination style="margin-top: 20px;" :total="total" v-model:current-page="currentPage" v-model:page-size="pageSize" @current-change="currentPageHandler">
      </el-pagination>


    </el-card>

    <!--展示某个 sku 详情信息的组件-->
    <ElDrawer v-model="isShowDrawer" :with-header="false">
<!--      <el-form>-->
<!--        <el-form-item label="名称">-->
<!--          .....-->
<!--        </el-form-item>-->
<!--        <el-form-item label="名称">-->
<!--          .....-->
<!--        </el-form-item>-->
<!--      </el-form>-->


      <el-row>
        <el-col :span="8">名称</el-col>
        <el-col :span="16">{{skuDetailData.skuName}}</el-col>
      </el-row>
      <el-row>
        <el-col :span="8">描述</el-col>
        <el-col :span="16">{{skuDetailData.skuDesc}}</el-col>
      </el-row>
      <el-row>
        <el-col :span="8">价格</el-col>
        <el-col :span="16">{{skuDetailData.price}}</el-col>
      </el-row>
      <el-row>
        <el-col :span="8">平台属性</el-col>
        <el-col :span="16">
          <el-tag type="success" v-for="item of skuDetailData.skuAttrValueList" :key="item.id">{{item.valueName}}</el-tag>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">销售属性</el-col>
        <el-col :span="16">
          <el-tag type="success" v-for="item of skuDetailData.skuSaleAttrValueList" :key="item.id">{{item.saleAttrName}} - {{item.saleAttrValueName}}</el-tag>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">商品图片</el-col>
        <el-col :span="16">
          <el-carousel trigger="click">
            <el-carousel-item v-for="item of skuDetailData.skuImageList" :key="item.id">
               <img :src="item.imgUrl" style="width: 100%; height: 100%;" />
            </el-carousel-item>
          </el-carousel>
        </el-col>
      </el-row>
    </ElDrawer>
  </div>
</template>

<script lang="ts">
export default {
  name: "ProductSku",
};
</script>


<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import api from "@/api/sku";
import { ElMessage, ElMessageBox } from "element-plus";


import type { ISKU } from "@/api/sku";


const currentPage = ref(1);
const total = ref(0);
const pageSize = ref(5);
const skuData = ref<ISKU[]>([]);

// 获取所有 SKU 数据（分页）
const getSKUData = async () => {
  try {
    const res = await api.list(currentPage.value, pageSize.value);

    currentPage.value = res.current;
    total.value = res.total;
    pageSize.value = res.size;
    skuData.value = res.records;
  } catch (e) {
    ElMessage.error('请求SKU数据失败');
  }
}

// 点击分页切换的时候重新发送请求
const currentPageHandler = async () => {
  await getSKUData();
}


// 编辑
const editHandler = () => {
  ElMessage.success('开发中...');
}

// 通过计算属性来定义按钮的 type 和 icon，这个 btnAttrs 是一个数组（因为对应了多组数据），数组里面在放对象，每一个对象对应着当前这条数据的按钮状态（type和icon）
const btnAttrs = computed(() => {
  return skuData.value.map((item) => {
      // 如果 item.isSale 为 true，则表示当前状态为 上架状态
      return {
        type: item.isSale ? 'success' : 'info',
        icon: 'ele-' + (item.isSale ? 'Top' : 'Bottom')
      }
  })
})

// 上架和下架
const changeSaleHandler = async (data: ISKU) => {
  try {
    if (data.isSale) {
      // 当前 data 为 上架的状态，那么就调用下架接口
      await api.cancelSale(data.id);
      ElMessage.success('下架成功');
    } else {
      // 调用上架的接口
      await api.onSale(data.id);
      ElMessage.success('上架成功');
    }
    // 操作成功以后，需要重新获取当前页的列表重新更新视图
    await getSKUData();
  } catch(e) {
    ElMessage.error('上下架操作失败');
  }
}

// 删除
const deleteHandler = (id: number) => {
  ElMessageBox.confirm('您确定要删除吗？', '提示', {
    async callback(msg: "confirm" | "close" | "cancel") {
      if (msg === "confirm") {
        try {
          await api.delete(id);
          ElMessage.success('删除成功');

          await getSKUData();
        } catch (e) {
          ElMessage.error('删除失败');
        }
      }
    }
  })
}


// 显示当前sku的详情信息
const skuDetailData = ref<ISKU>();
const isShowDrawer = ref(false);
const showDetailHandler = async (id: number) => {
  try {
    // 先获取到数据
    skuDetailData.value = await api.detail(id);
    // skuDetailData.value.
    // 然后再显示抽屉
    isShowDrawer.value = true;
  } catch (e) {
    ElMessage.error('获取sku详情信息失败了');
  }
}


// 当组件挂载完成的时候调用请求
onMounted(async () => {
 await getSKUData();
})
</script>

<style lang="scss" scoped>
.el-row {
  margin: 10px 0;

  .el-col-8 {
    font-size: 20px;
    font-weight: bold;
  }

  .el-tag {
    margin: 5px;
  }
}

.el-carousel :deep(.el-carousel__button)  {
 background-color: red;
}
</style>