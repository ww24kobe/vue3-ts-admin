import request from '@/utils/request';

import type {IAttr, IAttrValueList} from '@/types/app';

// 后端返回的基础销售属性
export interface IBaseSaleAttr {
    id: number;
    name: string;
}

export type TAttrValueList = Pick<IAttrValueList, "valueName"> & { isEdit?: boolean };
export type TFormData = Omit<IAttr, "id" | "attrValueList"> & {
    id?: number;
    attrValueList: TAttrValueList[];
};

enum Apis {
    getAttrs = "/admin/product/attrInfoList/",
    addOrUpdateAttr = "/admin/product/saveAttrInfo",
    deleteAttr = "/admin/product/deleteAttr/",

    getBaseSaleAttrs = "/admin/product/baseSaleAttrList"
}

export async function getAttrs(id1: number|string, id2: number|string, id3: number|string) {
    return request.get<any, IAttr[]>(Apis.getAttrs + `${id1}/${id2}/${id3}`);
}

export function addOrUpdateAttr(data: TFormData) {
    return request.post(Apis.addOrUpdateAttr, data);
}

export function deleteAttr(id: number) {
    return request.delete(Apis.deleteAttr + id);
}

// 获取基础销售属性
export async function getBaseSaleAttrs() {
    return request.get<any, IBaseSaleAttr[]>(Apis.getBaseSaleAttrs);
}