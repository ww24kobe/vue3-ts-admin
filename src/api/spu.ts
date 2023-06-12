/**
 * 先来确定类型，然后再写实现
 * 
 */
import request from '@/utils/request';

import type {ResPager} from '@/types/app'

import type {ISKU} from '@/api/sku';


export interface ISPU {
    /**
     * SPU所属分类ID，3级分类ID
     */
    category3Id: number;
    /**
     * SPU简介
     */
    description: string;
    /**
     * SPU的ID
     */
    id: number;
    /**
     * SPU名称
     */
    spuName: string;
    /**
     * 品牌ID
     */
    tmId: number;
}

// 后端返回的基础销售属性
export interface IBaseSaleAttr {
    id: number;
    name: string;
}

// 销售属性中的 spuSaleAttrValueList 中的数据是
export interface ISPUSaleAttrValueList {
    id: number;
    spuId: number;
    baseSaleAttrId: number;
    saleAttrName: string;
    saleAttrValueName: string;
}
// 后端返回的销售属性
export interface ISPUSaleAttr {
    id: number;
    supId: number;
    baseSaleAttrId: number;
    saleAttrName: string;
    spuSaleAttrValueList: ISPUSaleAttrValueList[];
}

// 图片列表
export interface ISPUImage {
    id: number;
    spuId: number;
    imgName: string;
    imgUrl: string;
    isDefault?: boolean;
}

// 添加 SPU 的传入的数据类型
export interface IPostSpuSaleAttrValue {
    baseSaleAttrId: number;
    saleAttrName: string;
    saleAttrValueName: string;
}
export interface IPostSpuImage {
    imgName: string;
    imgUrl: string;
}
export interface IPostSpuSaleAttr {
    baseSaleAttrId: number;
    saleAttrName: string;
    spuSaleAttrValueList: IPostSpuSaleAttrValue[]
}
export interface IPostSPU {
    category3Id: number;
    spuName: string;
    tmId: number;
    description?: string;
    spuImageList?: IPostSpuImage[];
    spuSaleAttrList?: IPostSpuSaleAttr[];
}

// 修改 SPU 的传入的数据类型
export interface IEditSpuImage {
    imgName: string;
    imgUrl: string;
}
export interface IEidtSpuSaleAttrValue {
    id?: number;
    spuId?: number;
    baseSaleAttrId: number;
    saleAttrName: string;
    saleAttrValueName: string;
}
export interface IEditSpuSaleAttr {
    id?: number;
    spuId?: number;
    baseSaleAttrId: number;
    saleAttrName: string;
    spuSaleAttrValueList: IEidtSpuSaleAttrValue[];
}
export interface IEditSPU {
    id: number;
    category3Id: number;
    spuName: string;
    tmId: number;
    description?: string;
    spuImageList?: IPostSpuImage[];
    spuSaleAttrList?: IEditSpuSaleAttr[];
}


enum URL {
    GET = "/admin/product/",
    GET_BASESALE_ATTR = '/admin/product/baseSaleAttrList',
    GET_SALE_ATTR = '/admin/product/spuSaleAttrList/',
    GET_IMAGE = '/admin/product/spuImageList/',

    ADD = "/admin/product/saveSpuInfo",
    EDIT = '/admin/product/updateSpuInfo',
    DELETE = '/admin/product/deleteSpu/',

    GET_SKU = '/admin/product/findBySpuId/'
}


// 定义接口类型
interface API {
    getList(category3Id: number, page: number, limit: number): Promise<ResPager<ISPU>>;
    getBaseSaleAttrList(): Promise<IBaseSaleAttr[]>;
    getSpuSaleAttrList(id: number): Promise<ISPUSaleAttr[]>;
    getSpuImageList(id: number): Promise<ISPUImage[]>;

    getSkuList(spuId: number): Promise<ISKU[]>;

    add(data: IPostSPU): void;

    edit(data: IEditSPU): void;

    delete(id: number): void;
}

// 实现接口
const api: API = {
    getList(category3Id:number, page: number, limit: number) {
        return request.get(`${URL.GET}${page}/${limit}`, {
            params: {
                category3Id
            }
        });
    },

    getBaseSaleAttrList() {
        return request.get(URL.GET_BASESALE_ATTR);
    },

    getSpuSaleAttrList(id: number) {
        return request.get(URL.GET_SALE_ATTR + id);
    },

    getSpuImageList(id: number) {
        return request.get(URL.GET_IMAGE + id);
    },

    add(data: IPostSPU) {
        return request.post(URL.ADD, data);
    },

    edit(data: IEditSPU) {
        return request.post(URL.EDIT, data);
    },

    delete(id: number) {
        return request.delete(URL.DELETE + id);
    },

    // 获取spu下的所有sku
    getSkuList(spuId: number) {
        return request.get(URL.GET_SKU + spuId);
    }
};

export default api;