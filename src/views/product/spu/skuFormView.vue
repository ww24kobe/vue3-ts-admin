<template>
  <div>
    <el-form :label-width="100">
      <el-form-item label="spu名称"> {{ data.spuName }} </el-form-item>
      <el-form-item label="SKU名称">
        <el-input v-model="baseFormData.skuName"></el-input>
      </el-form-item>
      <el-form-item label="价格">
        <el-input-number v-model="baseFormData.price"></el-input-number>
      </el-form-item>
      <el-form-item label="重量">
        <el-input-number v-model="baseFormData.weight"></el-input-number>
      </el-form-item>
      <el-form-item label="规格描述">
        <el-input
          type="textarea"
          :rows="4"
          v-model="baseFormData.skuDesc"
        ></el-input>
      </el-form-item>

      <el-form-item label="平台属性">
        <el-form inline :label-width="100">
          <!-- 循环 attrs 生成 el-form-item-->
          <el-form-item
            v-for="(attr, index) of attrs"
            :key="attr.id"
            :label="attr.attrName"
          >
            <!-- 
              attrSelect[0] = {attrId: 1,valueId: 1}
              attrSelect[1] = {attrId: 2,valueId: 6}
             -->
            <el-select placeholder="请选择" v-model="attrSelect[index]">
              <!-- 然后在根据 attr.attrValueList 来循环生成 option -->
              <el-option
                v-for="attrValue of attr.attrValueList"
                :label="attrValue.valueName"
                :key="attrValue.id"
                :value="`{&quot;attrId&quot;: ${attr.id},&quot;valueId&quot;: ${attrValue.id}}`"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-form inline :label-width="100">
          <el-form-item
            v-for="(attr, index) of saleAttrs"
            :key="attr.id"
            :label="attr.saleAttrName"
          >
            <el-select
              placeholder="请选择"
              v-model="selectedSaleAttrData[index]"
              @change="saleAttrChangeHandler"
            >
              <!-- 
                然后在根据 attr.attrValueList 来循环生成 option
                每一个 option的值如下：
                  value="57|85"
                  value="57|86"
               -->
              <el-option
                v-for="attrValue of attr.spuSaleAttrValueList"
                :label="attrValue.saleAttrValueName"
                :key="attrValue.id"
                :value="`${attr.id}|${attrValue.id}`"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="图片列表">
        <el-table :data="images" @selection-change="SelectionChangeHandler">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column label="图片" width="200">
            <template v-slot="{ row }">
              <img :src="row.imgUrl" style="width: 200px" />
            </template>
          </el-table-column>
          <el-table-column label="名称" prop="imgName"></el-table-column>
          <el-table-column label="操作">
            <template v-slot="{ row }">
              <el-tag v-if="row.isDefault" type="warning">默认</el-tag>
              <el-button v-else type="primary" @click="setDefaultHandler(row)"
                >设为默认</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="addSkuHandler">提交</el-button>
        <el-button @click="changeView()">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
export default {
  name: "skuFormView",
};
</script>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useBaseData } from "./skuForm/baseData";
import { useAttrData } from "./skuForm/attrData";
import { useImageData } from "./skuForm/imageData";
import api from "@/api/sku";

import type { ISPU } from "@/api/spu";
import type { IPostSKU } from "@/api/sku";
import { ElMessage } from "element-plus";

const { data } = defineProps<{
  data: ISPU;
}>();

const { baseFormData } = useBaseData(data.id, data.tmId, data.category3Id);
const { attrs, saleAttrs, attrsData, saleAttrsData } = useAttrData(data.id);
const { images, imagesData } = useImageData(data.id);

// 因为 我们定义的要收集的数据格式和select中的格式不对应，所以这里定义一个变量用来收集 select 组选择的数据，然后当这个数据变化的时候去更新 attrsData
const attrSelect = ref<string[]>([]);
watch(
  attrSelect,
  (newVal) => {
    // console.log(123);
    // ["{\"attrId\": 106,\"valueId\": 176}", "{\"attrId\": 23,\"valueId\": 120}"]
    attrsData.value = newVal
      .filter((item) => item)
      .map((item) => JSON.parse(item));
  },
  {
    deep: true,
  }
);

// 收集销售属性选中的值
const selectedSaleAttrData = ref<string[]>([]);
const saleAttrChangeHandler = () => {
  // console.log("selectedSaleAttrData", selectedSaleAttrData);
  saleAttrsData.value = selectedSaleAttrData.value.map((item) => {
    const [saleAttrId, saleAttrValueId] = item.split("|");
    return {
      saleAttrId: Number(saleAttrId),
      saleAttrValueId: Number(saleAttrValueId),
    };
  });
};

// 处理收集被选中的图片
// 可以利用 ts 中的 typeof 类型运算符来获取某个数据的类型
const SelectionChangeHandler = (data: typeof images.value) => {
  // console.log(data);
  imagesData.value = data;
};

// 设置默认图片
const setDefaultHandler = (data: typeof images.value[0]) => {
  // 循环所有的图片，在循环过程中进行判断：当前 data 和 循环中的某个数据是否相同，如果相同，则表示该图片数据要设置为 isDefault = true

  images.value.forEach((img) => {
    img.isDefault = data.id === img.id;
  });

  // 把当前点击的这个data的imgUrl赋值给 skuDefaultImg
  baseFormData.value.skuDefaultImg = data.imgUrl;

  // console.log(images);
};

const $emit = defineEmits(["changeView"]);
const changeView = () => {
  $emit("changeView", "spuListView");
};

const addSkuHandler = async () => {
  // 收集整理要提交到后端的数据
  // console.log(`baseFormData: `, baseFormData.value);

  // console.log("attrSelect: ", attrSelect);
  // console.log("attrsData: ", attrsData);

  // console.log("saleAttrsData: ", saleAttrsData);

  // console.log("imagesData", imagesData);

  console.log("添加");

  const postData: IPostSKU = {
    ...baseFormData.value,
    skuAttrValueList: [...attrsData.value],
    skuSaleAttrValueList: [...saleAttrsData.value],
    skuImageList: [...imagesData.value],
  };
  // console.log(postData);
  try {
    await api.add(postData);
    ElMessage.success("提交成功");

    changeView();
  } catch (e) {
    ElMessage.error("提交失败");
  }
};
</script>
