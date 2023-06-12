import {ref} from 'vue';
import api from '@/api/spu';
import { ElMessage } from 'element-plus';

import type {ISPUImage} from '@/api/spu';

export function useImageData(supId: number) {

    const images = ref<ISPUImage[]>([]);

    // 收集保存提交给后端的数据
    const imagesData = ref<ISPUImage[]>([]);

    // 获取指定 SPUid 下的所有图片数据
    async function getImagesData() {
        try {
            images.value = await api.getSpuImageList(supId);
        } catch(e) {
            ElMessage.error('获取失败');
        }
    }

    getImagesData();

    return {
        images,
        imagesData
    }

}