import request from '@/utils/request';

import type { ResPager } from "@/types/app";

import type {ISPUImage} from './spu';

export interface ISKU {
    // 当前 SKU 的基本信息
    id: number;
    // 当前 sku 的所属 SPU 的id
    spuId: number;
    // 当前 sku 的品牌
    tmId: number;
    // 当前 sku 的分类
    category3Id: number;
    // sku 的名称
    skuName: string;
    // sku 的价格
    price: number;
    // sku 的重量
    weight: number;
    // 介绍
    skuDesc: string;
    // 默认封面图片地址
    skuDefaultImg: string;
    // 上线状态
    isSale: boolean;
    // 创建时间
    createTime: string;
    // 图片列表
    skuImageList: ISKUImage[];

    skuAttrValueList: ISKUAttrValue[];

    skuSaleAttrValueList: ISKUSaleAttrValueList[];
}

export interface ISKUImage {
    id: number;
    skuId: number;
    imgName: string;
    imgUrl: string;
    spuImgId: number;
    isDefault: boolean;
}

export interface ISKUAttrValue {
    id?: number;
    skuId?: number;
    attrId: number;
    valueId: number;
    attrName?: string;
    valueName?: string;
}

export interface ISKUSaleAttrValueList {
    id?: number;
    skuId?: number;
    saleAttrId: number;
    saleAttrValueId: number;
    saleAttrName?:  string;
    saleAttrValueName?: string;
}

// 提交类型
export interface IPostSKU {
    // 当前 sku 的所属 SPU 的id
    spuId: number;
    // 当前 sku 的品牌
    tmId: number;
    // 当前 sku 的分类
    category3Id: number;
    // sku 的名称
    skuName: string;
    // sku 的价格
    price: number;
    // sku 的重量
    weight: number;
    // 介绍
    skuDesc: string;
    // 默认封面图片地址
    skuDefaultImg: string;
    // 所有的图片，当前 sku 所属 spu 的图片列表
    skuImageList: ISKUImage[];
    // sku平台属性列表
    skuAttrValueList: ISKUAttrValue[];
    // sku销售属性列表
    skuSaleAttrValueList: ISKUSaleAttrValueList[];
}

/**
 * data = {
 *  spuId: 1,
 *  ...,
 *  skuAttrValueList: [
 *      {attrId: 1, valueId: 100},
 *      {attrId: 3, valueId: 110},
 *      ...
 *  ]
 * }
 */

// 定义接口类型
interface API {
    // 添加 sku
    add(data: IPostSKU): void;

    // 获取所有的 sku 列表
    list(page: number, limit: number): Promise<ResPager<ISKU>>;

    // 上架
    onSale(id:number): Promise<void>;

    // 下架
    cancelSale(id: number): Promise<void>;

    // 删除
    delete(id: number):Promise<void>;

    // 获取指定 sku 的详情信息
    detail(id: number): Promise<ISKU>;
}

enum URL {
    ADD = "/admin/product/saveSkuInfo",

    LIST = "/admin/product/list/",

    ON_SALE = "/admin/product/onSale/",

    CANCEL_SALE = "/admin/product/cancelSale/",

    DELETE = "/admin/product/deleteSku/",

    DETAIL = "/admin/product/getSkuById/"
}

const api:API =  {
    add(data: IPostSKU) {
        return request.post(URL.ADD, data);
    },

    list(page, limit) {
        return request.get(`${URL.LIST}${page}/${limit}` );
    },

    onSale(id: number): Promise<void> {
        return request.get(URL.ON_SALE + id);
    },

    cancelSale(id: number): Promise<void> {
        return request.get(URL.CANCEL_SALE + id);
    },

    delete(id: number): Promise<void> {
        return request.delete(URL.DELETE + id);
    },

    detail(id: number): Promise<ISKU> {
        return request.get(URL.DETAIL + id);
    }
}


export default api;