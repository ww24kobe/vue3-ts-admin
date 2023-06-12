import {ref} from 'vue';
import {getAttrs} from '@/api/attr';
import api from '@/api/spu';
import {useAttrStore} from '@/stores/category'
import {storeToRefs} from 'pinia';

import type {IAttr} from '@/types/app';
import type {ISPUSaleAttr} from '@/api/spu';
import type {ISKUAttrValue, ISKUSaleAttrValueList} from '@/api/sku';
import { ElMessage } from 'element-plus';



export function useAttrData(spuId: number) {

    const attrs = ref<IAttr[]>();
    const saleAttrs = ref<ISPUSaleAttr[]>([]);

    // 存储用户选择的平台属性和对应的值
    const attrsData = ref<ISKUAttrValue[]>([]);
    const saleAttrsData = ref<ISKUSaleAttrValueList[]>([]);

    // 从仓库中获取 分类数据
    const {category1Id, category2Id, category3Id} = storeToRefs(useAttrStore());

    // 获取所有的平台属性数据
    async function getAttrsData() {
        try {
            attrs.value = await getAttrs(category1Id.value, category2Id.value, category3Id.value);
        } catch(e) {
            ElMessage.error('获取失败');
        }
    }

    // 获取当前spu所属的销售属性
    async function getSaleAttrData() {
        try {
            saleAttrs.value = await api.getSpuSaleAttrList(spuId);
        } catch(e) {
            ElMessage.error('获取失败');
        }
    }

    getAttrsData();
    getSaleAttrData();

    return {
        attrs,
        saleAttrs,
        attrsData,
        saleAttrsData
    }
}