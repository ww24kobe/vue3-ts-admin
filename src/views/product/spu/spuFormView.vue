<template>
  <div>
    <el-form :label-width="100">
      <el-form-item label="SPU名称">
        <el-input v-model="formDataBase.spuName"></el-input>
      </el-form-item>

      <el-form-item label="品牌">
        <el-select v-model="formDataBase.tmId">
          <el-option
            v-for="trademark of trademarks"
            :key="trademark.id"
            :label="trademark.tmName"
            :value="trademark.id"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="SPU描述">
        <el-input
          type="textarea"
          :rows="4"
          v-model="formDataBase.description"
        ></el-input>
      </el-form-item>

      <!-- 图片上传 -->
      <el-form-item label="SPU图片">
        <!-- 

            重点属性：action

            因为我们现在要是显示多张图片（支持多张），所以
            show-file-list 必须为 true（默认就是true）
            但是已上传文件列表的展示形式默认是文字，我们想要照片墙的模式
            所以，可以再通过 list-type 属性来设置展示模式
            list-type支持如下几个值：'text' | 'picture' | 'picture-card'，默认是 text

            on-preview: 当点击已上传的文件的时候触发
         -->
        <el-upload
          class="avatar-uploader"
          v-model:file-list="spuImageList"
          :action="uploadUrl"
          list-type="picture-card"
          :on-preview="previewImageHandler"
          :on-success="successHandler"
        >
          <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>

      <!-- 销售属性 -->
      <el-form-item label="销售属性">
        <el-select
          :placeholder="baseSaleAttrIdPlaceHolder"
          v-model="baseSaleAttrId"
        >
          <el-option
            v-for="baseSaleAttr of unuseBaseSaleAttrs"
            :key="baseSaleAttr.id"
            :label="baseSaleAttr.name"
            :value="baseSaleAttr.id + '|' + baseSaleAttr.name"
          ></el-option>
        </el-select>
        <el-button type="primary" @click="addSaleAttrHandler"
          >添加销售属性</el-button
        >
        <el-table style="margin-top: 20px" :data="formDataSaleAttr">
          <el-table-column
            label="序号"
            type="index"
            width="80"
          ></el-table-column>
          <el-table-column
            label="属性名"
            prop="saleAttrName"
            width="120"
          ></el-table-column>
          <el-table-column label="属性值">
            <template v-slot="{ row }">
              <el-tag
                v-for="spuSaleAttrValue of row.spuSaleAttrValueList"
                :key="spuSaleAttrValue.id"
                closable
                @close="deleteAttrValueHandler(spuSaleAttrValue, row)"
                >{{ spuSaleAttrValue.saleAttrValueName }}</el-tag
              >

              <!-- 当我们点击添加的时候，需要隐藏 el-button，显示 el-input -->
              <el-input
                ref="attrValueInputRef"
                style="width: 80px"
                v-if="row.isEdit"
                v-model="attrValue"
                @blur="attrValueInputRefBlurHandler(row)"
              ></el-input>
              <el-button v-else @click="addSaleAttrValueHandler(row)"
                >添加</el-button
              >
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template v-slot="{ row }">
              <el-button
                type="danger"
                icon="ele-Delete"
                @click="deleteAttrHandler(row)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <div>
        <el-button type="primary" @click="addSPUHandler">提交</el-button>
        <el-button @click="changeView">取消</el-button>
      </div>
    </el-form>

    <!-- 预览图片的容器 -->
    <el-dialog v-model="showDialog" @close="closeHandler">
      <button @click="showPreview(-1)">上一张</button>
      <img style="width: 100%; height: 100%" :src="previewImgSrc" />
      <button @click="showPreview(1)">下一张</button>
    </el-dialog>
  </div>
</template>

<script lang="ts">
export default {
  name: "spuFormView",
};
</script>

<script lang="ts" setup>
import { ref, computed, nextTick } from "vue";
import api from "@/api/spu";
import { getBaseSaleAttrs } from "@/api/attr";
import { getTradeMarksNoPager } from "@/api/trademark";
import { ElMessage } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import { useAttrStore } from "@/stores/category";
import { storeToRefs } from "pinia";

import type { ITrademark } from "@/types/app";
import type {
  IPostSPU,
  IPostSpuImage,
  IPostSpuSaleAttr,
  IBaseSaleAttr,
  IPostSpuSaleAttrValue,
  ISPU,
  IEditSPU,
} from "@/api/spu";
import type { UploadUserFile, UploadFile, UploadFiles } from "element-plus";

const { category3Id } = storeToRefs(useAttrStore());

// 定义一个 prop ，来接收编辑的时候传入的数据
const props = defineProps<{
  data?: ISPU;
}>();
// console.log(props.data);

// 因为要收集的数据比较多，结构比较复杂，所以，我们把要收集的数据进行分类，分别是用不同的变量来进行保存
// 在最后提交的时候，进行统一处理，只要保证调用 api.add 方法的时候传入的数据是满足格式要求的就可以了

// 如果是添加的时候用下面没有id的数据进行初始化
const formDataBase = ref<IPostSPU | IEditSPU>({
  category3Id: 0,
  spuName: "",
  tmId: 1,
  description: "",
});

const formDataImages = ref<IPostSpuImage[]>([]);
type IPostSpuSaleAttrEdit = IPostSpuSaleAttr & { isEdit: boolean };
const formDataSaleAttr = ref<IPostSpuSaleAttrEdit[]>([]);

// 保存所有品牌数据，给 el-select 使用
const trademarks = ref<ITrademark[]>();
// 获取所有的品牌列表数据
async function getTrademarksData() {
  try {
    trademarks.value = await getTradeMarksNoPager();
  } catch (e) {
    ElMessage.error("获取品牌数据失败");
  }
}

// 图片上传的逻辑
// 上传图片的地址，使用环境变量来设置地址，好处：在不同环境下会根据环境变量的值自动切换
let uploadUrl = `${import.meta.env.VITE_API_URL}/admin/product/upload`;
const spuImageList = ref<UploadUserFile[]>([]);
// 点击预览上传的图片
const previewImgSrc = computed({
  get() {
    return spuImageList.value[previewIndex.value]?.url;
  },
  set(val) {
    console.log(123);
  },
});
const showDialog = computed({
  get() {
    return !!previewImgSrc.value;
  },
  set() {},
});

const previewIndex = ref(-1);
// 上传完成后
const successHandler = (
  response: any,
  uploadFile: UploadFile,
  uploadFiles: UploadFiles
) => {};
const closeHandler = () => {
  //   showDialog.value = false;
  previewIndex.value = -1;
};
// 上下张
const showPreview = (v: number) => {
  previewIndex.value += v;
};
// uploadFile ： 当前点击的图片数据
const previewImageHandler = (uploadFile: UploadFile) => {
  //   图片预览的时候，我们不需要从 response 中获取上传图片的服务器地址，可以直接获取这个图片的本地地址
  //   previewImgSrc.value = uploadFile.url as string;
  //   previewImgSrc.value = (uploadFile.response as { data: string }).data;
  previewIndex.value = spuImageList.value.findIndex(
    (item) => item === uploadFile
  );
};

/********************************销售数据的收集*********************************** */
// 保存后端返回的基础销售属性数据
const baseSaleAttrs = ref<IBaseSaleAttr[]>([]);
const unuseBaseSaleAttrs = ref<IBaseSaleAttr[]>([]);
// 保存用户通过 el-select 选择后的值
const baseSaleAttrId = ref<string>("");
// 和销售属性表格中的输入框进行绑定，收集用户输入的值
const attrValue = ref("");

// 使用 computed 来监视 unuseBaseSaleAttrs 的变化
const baseSaleAttrIdPlaceHolder = computed({
  get() {
    return `还有 ${unuseBaseSaleAttrs.value.length} 个未选择`;
  },
  set(newVal) {
    newVal;
  },
});

// 获取基础销售属性（渲染到el-select）
async function getBaseSaleAttrsData() {
  try {
    baseSaleAttrs.value = await getBaseSaleAttrs();

    // console.log(baseSaleAttrs, formDataSaleAttr);
    // formDataSaleAttr 表示当前 spu 已经使用过的数据
    // baseSaleAttrs 后端返回的所有供选择的数据
    // 我们应该从 baseSaleAttrs 找到还没有使用，渲染到页面中

    // 从 formDataSaleAttr 里面去查找 baseSaleAttrs 中每一个数据是否已经存在了
    // 不存在的表示没使用的

    unuseBaseSaleAttrs.value = baseSaleAttrs.value.filter((item) => {
      // 通过 find 去查看 当前 item 是否在 formDataSaleAttr 存在
      // 如果res有值，则表示该item已经用过了
      const res = formDataSaleAttr.value.find(
        (v) => v.baseSaleAttrId == item.id
      );
      return !res;
    });

    // baseSaleAttrId.value = `还有 ${unuseBaseSaleAttrs.value.length} 个未选择`;
  } catch (e) {
    ElMessage.error("基础销售属性获取失败");
  }
}

function addSaleAttrHandler() {
  const [id, name] = baseSaleAttrId.value.split("|");
  // isNaN: Not a Number
  if (isNaN(Number(id)) || !name) {
    return;
  }
  formDataSaleAttr.value.push({
    baseSaleAttrId: Number(id),
    saleAttrName: name,
    spuSaleAttrValueList: [],
    isEdit: false,
  });

  // 从基础销售属性中删除当前选择的项
  unuseBaseSaleAttrs.value = unuseBaseSaleAttrs.value.filter(
    (item) => item.id != Number(id)
  );
  baseSaleAttrId.value = "";
}

const attrValueInputRef = ref<HTMLInputElement>();
// 添加销售属性值
const addSaleAttrValueHandler = (data: IPostSpuSaleAttrEdit) => {
  // 进入编辑状态
  data.isEdit = true;

  nextTick(() => {
    attrValueInputRef.value?.focus();
  });
};
// 当属性值输入框失去焦点的时候
const attrValueInputRefBlurHandler = (data: IPostSpuSaleAttrEdit) => {
  // 把用户输入的值保存到 data 的  spuSaleAttrValueList
  // console.log(formDataSaleAttr.value, data)

  // 在把 attrValue 数据添加到 spuSaleAttrValueList 数组之前，验证一下该值在这个数组是否已经存在了（是否有相同名字的）
  const isExists = data.spuSaleAttrValueList.find(
    (item) => item.saleAttrValueName == attrValue.value
  );
  // console.log(isExists);

  if (isExists) {
    // 已存在相同
    ElMessage.error("已经存在相同值");
  } else {
    data.spuSaleAttrValueList.push({
      baseSaleAttrId: data.baseSaleAttrId,
      saleAttrName: data.saleAttrName,
      saleAttrValueName: attrValue.value,
    });
  }

  // 清空输入框中的值
  attrValue.value = "";

  // 进入非编辑状态
  data.isEdit = false;
};

// 删除指定的销售属性值
const deleteAttrValueHandler = (
  data: IPostSpuSaleAttrValue,
  datas: IPostSpuSaleAttrEdit
) => {
  datas.spuSaleAttrValueList = datas.spuSaleAttrValueList.filter(
    (item) => item != data
  );
};

// 删除指定的销售属性
const deleteAttrHandler = (data: IPostSpuSaleAttrEdit) => {
  formDataSaleAttr.value = formDataSaleAttr.value.filter(
    (item) => item != data
  );
  // 把当前删除的这一项放回到 unuseBaseSaleAttrs 列表中
  // console.log(data, unuseBaseSaleAttrs);
  unuseBaseSaleAttrs.value.push({
    id: data.baseSaleAttrId,
    name: data.saleAttrName,
  });
};

/********************************提交*********************************** */
const addSPUHandler = async () => {
  // 把 formDataBase、formDataImages、formDataSaleAttr 进行整合格式化，提交给后端

  let formData: IPostSPU | IEditSPU;

  // 整合 formDataBase
  formData = {
    ...formDataBase.value,
    category3Id: Number(category3Id.value),
  };

  // 把组件中的 spuImageList 数据提取出来，保存成接口要的格式
  formData.spuImageList = spuImageList.value.map((item) => {
    // @ts-ignore
    // 首先从 response 去获取上传的图片路径
    let url = item.response?.data;
    // 但是，在编辑的时候，后端传递给我们，然后我们转成组件要的数据，这个是没有 response，所以这个时候，我们就从 数据的 url 中去获取地址
    if (!url) {
      url = item.url;
    }
    return {
      imgName: item.name as string,
      imgUrl: url,
    };
  });

  // 收集销售属性
  formData.spuSaleAttrList = formDataSaleAttr.value.map((item) => {
    return {
      baseSaleAttrId: item.baseSaleAttrId,
      saleAttrName: item.saleAttrName,
      spuSaleAttrValueList: item.spuSaleAttrValueList,
    };
  });

  console.log(formData);

  const actionType = (formData as IEditSPU).id ? "修改" : "添加";

  if (formData) {
    try {
      if ((formData as IEditSPU).id) {
        // 修改
        await api.edit(formData as IEditSPU);
      } else {
        await api.add(formData);
      }
      ElMessage.success(`${actionType}成功`);
      changeView();
    } catch (e) {
      ElMessage.error(`${actionType}失败`);
    }
  }
};

const $emit = defineEmits(["changeView"]);
function changeView() {
  $emit("changeView", "spuListView");
}

// 获取指定spu下图片列表数据
const getSpuImageListData = async () => {
  // 图片

  try {
    const res = await api.getSpuImageList(Number(props.data?.id));
    // 对后端获取到图片数据进行处理，然后在绑定到el-upload 组件中
    spuImageList.value = res.map((item) => {
      return {
        name: item.imgName,
        url: item.imgUrl,
      };
    });
  } catch (e) {
    ElMessage.error("获取图片列表数据失败");
  }
};

// 获取指定spu下的所有销售属性数据
const getSpuSaleAttrListData = async () => {
  try {
    const res = await api.getSpuSaleAttrList(Number(props.data?.id));
    // 因为后端返回的接口数据中不存在 isEdit 属性，这个属性是我们为了做编辑效果临时添加的，所以，我们需要在后端返回的数据中给每一条数据添加一个 isEdit 属性
    formDataSaleAttr.value = res.map((item) => {
      return {
        ...item,
        isEdit: false,
      };
    });
  } catch (e) {
    ElMessage.error("获取spu销售属性列表数据失败");
  }
};

// 如果是编辑，则需要通过 props.data 来对这个数据进行初始化
if (props.data?.id) {
  // 编辑状态
  formDataBase.value = {
    ...props.data,
  };

  // 获取当前spu的图片数据
  getSpuImageListData();
  // 获取当前spu的销售属性数据
  getSpuSaleAttrListData();
}
getTrademarksData();
getBaseSaleAttrsData();
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
