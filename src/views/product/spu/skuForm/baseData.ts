import {ref} from 'vue';

import type { IPostSKU } from "@/api/sku";

// 类似 hook 文件一般导出一个 函数，这样在其他引用该文件的地方，就可以调用该函数传参来进行一些初始化工作
export function useBaseData(spuId:number, tmId:number, category3Id:number) {
    // 收集表单中的基础数据
    const baseFormData = ref<
    Pick<
    IPostSKU,
    | "spuId"
    | "tmId"
    | "category3Id"
    | "skuName"
    | "price"
    | "weight"
    | "skuDesc"
    | "skuDefaultImg"
    >
    >({
        spuId,
        tmId,
        category3Id,
        skuName: "",
        price: 1,
        weight: 1,
        skuDesc: "",
        skuDefaultImg: ""
    });

    return {
        baseFormData
    }
}