<template>
  <div>
    <el-card>
      <!-- <CategorySelector
        @change-categoryId-3="changeCategoryId3Handler"
      ></CategorySelector> -->

      <CategorySelector :disabled="!isShowListView"></CategorySelector>
    </el-card>

    <el-card style="margin-top: 20px">
      <!-- 列表布局 -->

      <div v-if="isShowListView">
        <!-- 
        当 category3Id 为空的时候禁用按钮
       -->
        <el-button
          type="primary"
          icon="ele-Plus"
          :disabled="category3Id === ''"
          @click="addHander"
          >添加属性</el-button
        >
        <el-table style="margin-top: 20px" :data="attrsData">
          <el-table-column
            label="序号"
            type="index"
            width="100px"
          ></el-table-column>
          <el-table-column
            label="属性名称"
            prop="attrName"
            width="200px"
          ></el-table-column>
          <el-table-column label="属性值名称列表">
            <template v-slot="{ row }">
              <el-tag
                v-for="attrValueList of row.attrValueList"
                :key="attrValueList.id"
                type="success"
              >
                {{ attrValueList.valueName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200px">
            <template v-slot="{ row }">
              <el-button
                type="warning"
                icon="ele-Edit"
                @click="editHandler(row)"
              ></el-button>
              <el-button
                type="danger"
                icon="ele-Delete"
                @click="deleteHandler(row.id)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 表单布局 -->
      <div v-else>
        <!-- 添加属性名称的表单 -->
        <el-form inline>
          <el-form-item label="属性名">
            <el-input
              clearable
              v-model="formData.attrName"
              @blur="attrNameBlurHandler"
            ></el-input>
          </el-form-item>
        </el-form>

        <div>
          <!-- 如果属性名称为空，则禁用添加属性值的按钮 -->
          <el-button
            type="primary"
            :disabled="!formData.attrName"
            @click="addAttrValueHandler"
            >添加属性值</el-button
          >
          <el-button @click="toggleView(true)">取消</el-button>
        </div>

        <!-- 属性值列表 -->
        <el-table style="margin-top: 20px" :data="formData.attrValueList">
          <el-table-column
            label="序号"
            width="180"
            type="index"
          ></el-table-column>
          <el-table-column label="属性值名称">
            <template v-slot="{ row }">
              <!-- 为了能够区分当前的编辑状态，所以我们就给每一条数据添加一个自定义的属性 isEdit，来代表当前数据的编辑状态，然后通过这个状态的变化，动态显示 span 还是 input -->
              <!-- span 是编辑完成后显示的数据内容 -->
              <span v-if="!row.isEdit" @click="showInputHandler(row)">{{
                row.valueName
              }}</span>
              <!-- input 是编辑的时候显示的 -->
              <!-- 把当前行的 el-input 的 v-model 和 当前行数据 row 中的 valueName 属性进行双向绑定 -->
              <el-input
                v-else
                v-model="row.valueName"
                @blur="attrNameValueBlurHandler(row)"
                ref="inputRef"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template v-slot="{ row }">
              <el-button
                icon="ele-Delete"
                @click="removeAttrValueHandler(row)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>

        <div style="margin-top: 20px">
          <el-button
            type="primary"
            :disabled="!formData.attrName"
            @click="saveHandler"
            >保存</el-button
          >
          <el-button @click="toggleView(true)">取消</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
export default {
  name: "ProductAttr",
};
</script>

<script lang="ts" setup>
// import CategorySelector from '@/components/CategorySelector/index.vue';

// 从仓库中导入数据
import { useAttrStore } from "@/stores/category";
import { storeToRefs } from "pinia";
// nextTick 是一个独立方法，从 vue 中引入，vue2 是 Vue.nextTick() this.$nextTick()
import { watch, ref, nextTick } from "vue";
import { getAttrs, addOrUpdateAttr, deleteAttr } from "@/api/attr";
import { ElMessage, ElMessageBox } from "element-plus";
import { cloneDeep } from "lodash";

import type { IAttr, IAttrValueList } from "@/types/app";
import type { TAttrValueList, TFormData } from "@/api/attr";
import type { Action } from "element-plus";

// 调用 useAttrStore 得到 attr 这个仓库的具体实例
const attrStore = useAttrStore();

const { category1Id, category2Id, category3Id } = storeToRefs(attrStore);

// 控制列表和添加视图的切换
// 使用 isShowListView 取反来控制 CategorySelector 组件的禁用状态
const isShowListView = ref(true);

// 列表视图和编辑视图的切换
const toggleView = (v: boolean) => {
  isShowListView.value = v;
};

/**********************属性列表**********************************/

// 存储指定分类下的所有属性列表数据
const attrsData = ref<IAttr[]>();

async function getAttrsData() {
  // 发送请求，获取当前选择的分类下的所有平台属性数据
  // 当 category3Id 的值不为空的时候发请求
  attrsData.value = [];
  if (category3Id.value != "") {
    attrsData.value = await getAttrs(
      category1Id.value,
      category2Id.value,
      category3Id.value
    );
  }
}

// 这里不需要使用 watchEffect 去实现，因为不需要在一开就发送请求
watch(category3Id, getAttrsData, {
  immediate: true,
});

// const changeCategoryId3Handler = (id: number) => {
//   console.log("发送请求：", id);
// };

/**********************添加属性**********************************/
/**
 * formData 的 typescript 类型该如何去确定编写
 *
 * 如果我们直接使用 IAttr 类型来约束 formData 格式，就会出现添加的时候类型不准确的问题
 *  - id 这个属性在添加的时候，是不需要的
 * 我们就需要改造一下类型的约束
 *
 * 因为 attrValueList 类型中的一些属性在添加的时候也是不需要的，所以，我们可以通过交叉类型 Pick 等方法来重新构建 attrValueList 的类型
 */

// 构建后端需要的数据，确定类型格式 formData
// 收集数据保存到 fromData
// 核心工作：formData 中数据从什么地方获取
// 这里给初始值主要是避免调用 formData 的时候加 ?
const formData = ref<TFormData>({
  // 从表单中获取
  attrName: "",
  // 从仓库中获取
  categoryId: 0,
  // 固定的
  categoryLevel: 3,
  // 表格中获取
  attrValueList: [],
});
// input 的实例
const inputRef = ref<HTMLInputElement>();

// 显示添加
const addHander = () => {
  toggleView(false);

  // 每次点击添加的时候，重置数据（formData中有可能保存了上一次编辑的时候赋值上去的数据）
  formData.value = {
    // 从表单中获取
    attrName: "",
    // 从仓库中获取
    categoryId: 0,
    // 固定的
    categoryLevel: 3,
    // 表格中获取
    attrValueList: [],
  };
};

// 验证输入的属性名称是否合法
const attrNameBlurHandler = (e: FocusEvent) => {
  const val = formData.value.attrName.trim();
  if (val !== "") {
    // 验证：当前输入的名称是否在已有的属性名称列表中存在了
    // console.log(attrsData.value);

    // 判断 val 在 attrsData 数组中是否存在同名的数据
    const result = attrsData.value?.find((item) => item.attrName === val);
    if (result) {
      // 找到了同名属性数据
      ElMessage.error("输入的属性名称已经存在了");
      // 清空输入框中的内容
      formData.value.attrName = "";

      (e.target as HTMLElement)?.focus();
    }
  }
};

const addAttrValueHandler = () => {
  // 点击添加属性值按钮，其实就是像 attrValueList 添加一条默认记录
  formData.value.attrValueList.push({
    valueName: "",
    // 表示当前这条数据是否是编辑状态
    isEdit: true,
  });

  // 给当前渲染出来的input添加焦点
  // 如果直接向下面这样写，是会有问题的，因为渲染是异步的，而下面代码是同步
  // 下面的代码执行完成以后，才开始触发渲染
  // 我们应该让下面的代码在渲染完成以后再调用
  // inputRef.value?.focus();
  nextTick(() => {
    // 这个回调函数会在渲染完成（下一个渲染之前）的时候调用
    inputRef.value?.focus();
  });
};

// 当属性值输入框失去焦点的时候触发
const attrNameValueBlurHandler = (row: TAttrValueList) => {
  // 校验值的合法性
  const val = row.valueName.trim();

  // 判断值是否为空
  // 当有输入值的时候，还需要进行查重（当前row的valueName在已有的 attrValueList 中是否存在相同 valueName 的值，如果有则删除 row）
  // attrValueList : [4,row,7]
  // row: 2
  const res = formData.value.attrValueList.find((item) => {
    // 这里需要注意，一定要比较 item 是否 和 row 相等，然后再去比较 valueName 是否相等
    return item !== row && item.valueName === row.valueName;
  });
  if (val === "" || res) {
    // 删除该项数据，从 attrValueList 中删除 row
    formData.value.attrValueList = formData.value.attrValueList.filter(
      (item) => item !== row
    );
  } else {
    // console.log(123);
    // 设置当前行为非编辑状态
    row.isEdit = false;
  }
};

// 当点击span触发编辑的时候
const showInputHandler = (row: TAttrValueList) => {
  row.isEdit = true;
  nextTick(() => {
    // 这个回调函数会在渲染完成（下一个渲染之前）的时候调用
    inputRef.value?.focus();
  });
};

// 删除指定的属性值
// 这里的删除不会直接调用后端，而是从 formData 收集的数据中删除
const removeAttrValueHandler = (row: TAttrValueList) => {
  formData.value.attrValueList = formData.value.attrValueList.filter(
    (item) => item != row
  );
};

/*************************编辑***************************** */
const editHandler = (data: IAttr) => {
  // 我们想添加和编辑的视图是同一个，那么我们在这里就把当前 data 的值直接赋值给 formData
  // 注意：不能直接赋值
  // 这里可以使用深拷贝来实现赋值
  formData.value = cloneDeep(data);
  // console.log(formData.value.attrValueList === data.attrValueList);

  // 显示视图
  isShowListView.value = false;
};

/********************保存************************ */
const saveHandler = async () => {
  // 如果 id 存在，则 action 表示的修改，否则是添加
  const action = formData.value.id;

  if (!action) {
    // 添加
    // categoryId 的收集在这里做
    formData.value.categoryId = Number(category3Id.value);
  }

  // console.log("提交后端进行保存", formData.value);

  try {
    await addOrUpdateAttr(formData.value);
    ElMessage.success(`${action ? "编辑" : "添加"}成功`);
    isShowListView.value = true;
    // 重新获取列表数据
    getAttrsData();
  } catch (e) {
    ElMessage.error(`${action ? "编辑" : "添加"}失败`);
  }
};

/****************删除*************** */
const deleteHandler = async (id: number) => {
  ElMessageBox.confirm("你确定要删除吗？", "提示", {
    async callback(action: Action) {
      if (action === "confirm") {
        try {
          await deleteAttr(id);

          ElMessage.success("删除成功");

          // 重新获取列表数据
          getAttrsData();
        } catch (e) {
          ElMessage.success("删除失败");
        }
      }
    },
  });
};
</script>
