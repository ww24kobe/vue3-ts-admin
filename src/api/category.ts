import request from '@/utils/request';

import type {ICategory} from '@/types/app';

enum Apis {
    getCategories1 = "/admin/product/getCategory1",
    getCategories2 = "/admin/product/getCategory2/",
    getCategories3 = "/admin/product/getCategory3/",
}

/**
 * 获取一级分类数据
 * @returns 
 */
export async function getCategories1() {
    return request.get<any, ICategory[]>(Apis.getCategories1);
}

/**
 * 获取二级分类数据
 * @param id{number | string} 一级分类的id
 * @returns 
 */
export async function getCategories2(id: number | string) {
    return request.get<any, ICategory[]>(Apis.getCategories2 + id);
}

/**
 * 获取三级分类数据
 * @param id{number | string} 二级分类的id
 * @returns 
 */
export async function getCategories3(id: number | string) {
    return request.get<any, ICategory[]>(Apis.getCategories3 + id);
}