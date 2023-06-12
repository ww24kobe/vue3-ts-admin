<template>
  <div>
    <el-card shadow="hover">
      <template #header>
        <el-button type="primary" :icon="Plus" @click="showDialogHandler"
          >添加</el-button
        >
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
            <template v-slot="{ row }">
              <!-- 给按钮添加编辑修改的方法，点击后显示对话框 -->
              <el-button
                type="warning"
                :icon="Edit"
                @click="showEditViewHandler(row)"
                >修改</el-button
              >
              <el-button
                type="danger"
                :icon="Delete"
                @click="deleteHandler(row.id)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 
        prev, pager, next, jumper, ->, total
        每一个字符串表示分页中每一个布局模块
        prev：上一页的布局
        next：下一页的布局
        pager：分页器（1,2,3）布局
        jumper：跳转布局
        ->：设置布局，箭头左侧的内部显示在整个分页布局的左侧，箭头右侧的内容显示在整个分页布局的右侧
        total：总页码的布局
       -->
      <el-pagination
        style="margin-top: 20px"
        v-model:page-size="pageSize"
        v-model:current-page="currentPage"
        :page-sizes="[5, 10, 20, 30]"
        layout="prev, pager, next, jumper, ->, sizes,total"
        :total="total"
        @size-change="sizeChangeHanlder"
      ></el-pagination>
    </el-card>

    <el-dialog v-model="showDialog" title="添加品牌">
      <el-form :model="formData" :rules="formDataRules" ref="formRef">
        <!-- 通过 el-form-item 组件的 prop 属性来绑定验证规则 -->
        <el-form-item label="品牌名称" prop="tmName">
          <el-input v-model="formData.tmName"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" prop="logoUrl">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :show-file-list="false"
            :on-success="uploadSuccessHandler"
            :before-upload="beoforeUploadHandler"
          >
            <img
              v-if="formData.logoUrl"
              class="avatar"
              :src="formData.logoUrl"
            />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button @click="addTrademarkHandler">提交</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script lang="ts">
export default {
  name: "ProductTrademark",
};
</script>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch, watchEffect } from "vue";
import { Plus, Edit, Delete } from "@element-plus/icons-vue";
import {
  getTradeMarks,
  addTrademark,
  updateTrademark,
  deleteTrademark,
} from "@/api/trademark";
import { ElMessage, ElMessageBox } from "element-plus";

import type { ITrademark } from "@/types/app";
import type { FormInstance, FormRules, UploadRawFile } from "element-plus";

//************ 列表 ******************/
// 定义一个变量用来接收当前页面的品牌列表数据
// let trademarks = reactive<ITrademark[]>([]);
let trademarks = ref<ITrademark[]>([]);

// 当前页
let currentPage = ref(1);

// 每页显示的条数
let pageSize = ref(5);

// 总数
let total = ref(0);

// 总页数
let pages = ref(1);

// 当每页显示条数发生改变的时候触发
const sizeChangeHanlder = () => {
  console.log(123);
};

// 发送请求列表的方法
const getTradeMarksData = async () => {
  // if (currentPage.value > pages.value) {
  //   console.log("over");
  //   return;
  // }

  const res = await getTradeMarks(currentPage.value, pageSize.value);

  // trademarks = []
  // trademarks.length = 0;
  // trademarks = Object.assign(trademarks, res.records);

  trademarks.value = res.records;

  // console.log(trademarks);

  currentPage.value = res.current;
  pageSize.value = res.size;
  total.value = res.total;
  pages.value = res.pages;
};

// getTradeMarksData();

watch(
  currentPage,
  () => {
    getTradeMarksData();
  },
  {
    immediate: true,
  }
);

// 类似 watch 的立即执行，且不需要指明监听对象（通过回调函数执行来收集函数中使用到的响应式数据）
// watchEffect(getTradeMarksData);

//************ 添加 ******************/
let showDialog = ref(false);
// 上传图片的地址，使用环境变量来设置地址，好处：在不同环境下会根据环境变量的值自动切换
let uploadUrl = `${import.meta.env.VITE_API_URL}/admin/product/upload`;
// 收集表单数据
// 因为 ITrademark 中包含 id，但是收集数据的时候是不需要的，所以，我们要把 id 属性给排序
// 因为 formData 这个数据既要用于添加又要用于编辑，那么我们这个数据的类型就需要特殊处理一下，
// 把id变成可选的，其他属性都是必填的
let formData = ref<Omit<ITrademark, "id"> & { id?: number }>({
  tmName: "",
  logoUrl: "",
});

const showDialogHandler = () => {
  formData.value = {
    tmName: "",
    logoUrl: "",
  };

  showDialog.value = true;

  // 清除上一次的验证状态
  // ? 和 ! 可选链操作符 ？断言前面的变量值一定存在，!（TypeScript） 断言前面的值一定不是 undefined
  formRef.value?.clearValidate();
};

// 上传图片之前的验证
// (rawFile: UploadRawFile) => Awaitable<void | undefined | null | boolean | File | Blob>
const allowUploadFileTypes = ["image/png", "image/jpeg", "image/gif"];
const beoforeUploadHandler = (rawFile: UploadRawFile) => {
  // console.log(rawFile);

  // rawFile 是一个对象（当前选择的文件），可以通过 type 和 size 来获取文件的类型和大小（字节）
  // 1kb = 1024byte
  if (
    !allowUploadFileTypes.includes(rawFile.type) ||
    rawFile.size > 1 * 1024 * 1024
  ) {
    ElMessage.error("上传文件的类型或大小不符合要求");
    return false;
  }

  // 这里的 return true 最好加上
  return true;
};

// 上传成功
// (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => void
// response: 上传调用完成以后后端返回的数据对象
// uploadFile: 当前上传文件信息
// uploadFiles: 所有已经上传的文件信息
const uploadSuccessHandler = (response: any) => {
  // console.log(response)
  formData.value.logoUrl = response.data;
};

// 验证规则
// 验证上传图片是否合法的验证器函数
const logoUrlValidator = (rule: any, value: string, cb: any) => {
  // 验证当前url是否合法
  // if (/^http[s]:\/\/$/.test(value)) {
  if (value.trim() !== "") {
    cb();
  } else {
    cb(new Error("图片地址不合法"));
  }
};
const formDataRules: FormRules = {
  // key 为要验证的字段名称，值是一个数组，数组包含多个验证对象
  tmName: [
    // ^ 起始，$ 结束
    // . 任意字符（除了换行符）
    {
      required: true,
      pattern: /^.{1,20}$/,
      message: "品牌名称不能小于3个字符或者大于20个字符",
    },
  ],
  logoUrl: [{ required: true, validator: logoUrlValidator }],
};

/******************添加**********************/
const formRef = ref<FormInstance>();
const addTrademarkHandler = async () => {
  // 针对整个表单进行验证
  try {
    const valid = await formRef.value?.validate();
    // console.log(valid);

    // 因为我们的添加和编辑都是使用同一个表单来完成的，点击表单中的按钮调用的是当前同一个方法，所以我们需要在这个方法中对添加还是编辑做一个判断，调用不同的接口，显示不同的提示信息

    // 添加数据
    try {
      if (formData.value.id) {
        // 编辑
        await updateTrademark(formData.value as ITrademark);

        getTradeMarksData();
      } else {
        // 添加
        await addTrademark(formData.value);
        // 判断一下当前页面数据的数量是否已经满（当前页的数据 >= pageSize 的值）
        // 如何获取当前页的数据：trademarks.length
        if (trademarks.value.length >= pageSize.value) {
          // 把当前页 currentPage + 1
          // 因为 currentPage 被 watch 过，所以这里改值就会直接触发请求，所以这里不需要手动调用方法了
          currentPage.value += 1;
        }
      }

      ElMessage.success(`${formData.value.id ? "编辑" : "添加"}成功`);
    } catch (e) {
      ElMessage.error(`${formData.value.id ? "编辑" : "添加"}失败`);
    }

    showDialog.value = false;

    // 重新获取列表数据，更新表格中的列表数据
    // 如果是添加，则还需要考虑当前页面的数据数量是否已经满了，如果是这种情况，添加的数据应该是在下一页的，所以这里需要处理一下发送请求的当前页数据（currentPage）
    // getTradeMarksData();
  } catch (e) {
    // console.log('error',e);
    ElMessage.error("数据有错");
  }
};

/******************编辑**********************/
const showEditViewHandler = (editData: ITrademark) => {
  // 把当前要编辑的数据赋值给 formData

  showDialogHandler();

  // 这里不要直接把 editData 的数据赋值给 formData，因为这样 formData 和 editData 就是指向了同一个地址
  // 就会出现：修改表单数据（不提交）也会把 列表中的数据给修改了
  // formData.value = editData;

  // formData.value.id = editData.id;
  // formData.value.tmName = editData.tmName;
  // formData.value.logoUrl = editData.logoUrl;

  // Object.assign(formData.value, editData);

  formData.value = { ...editData };
};

/******************删除**********************/
const deleteHandler = async (id: number) => {
  // 针对危险操作，一般都会首先提供一个对话框让用户进行二次确认，这里就可以使用 ElMessageBox

  // 只有一个 确认 按钮
  // ElMessageBox.alert('你确定要删除吗？', '提示');

  // 有两个按钮 取消 和 确认
  ElMessageBox.confirm("你确定要删除吗？", "提示", {
    type: "warning",
    // 当对话框关闭的时候触发 callback 调用，我们可以通过这个回调函数的第一个参数获取到关闭的原因（confirm:点击了确认，cancel: 点击了取消，close： 点击了关闭按钮）
    async callback(action: "confirm" | "cancel" | "close") {
      // console.log(action);
      if (action === "confirm") {
        // 发送请求删除数据
        try {
          await deleteTrademark(id);
          ElMessage.success("删除成功");

          // 同样的，在这里还需要考虑重新请求列表数据更新，并注意当前页码的值
          // 如果当前页只有一条数据的时候，currentPage - 1
          if (trademarks.value.length == 1) {
            currentPage.value -= 1;
          } else {
            // 这里的 else 一定要加，否则当 currentPage 变化的时候，会导致两次请求
            getTradeMarksData();
          }
        } catch (e) {
          ElMessage.error("删除失败");
        }
      }
    },
  });

  // 有一个输入框
  // ElMessageBox.prompt('你确定要删除吗？', '提示');

  // 还可以调通用方法
  // ElMessageBox({
  //   title: '标题',
  //   message: '内容',
  // })
};
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
