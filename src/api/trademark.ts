import request from "@/utils/request";
import type { IResTrademark, ITrademark } from "@/types/app";

// 使用 Enum 类定义这种数据列表
// const Apis = {
//   pageList: "/admin/product/baseTrademark/{page}/{limit}",
// };
enum Apis {
  pageList = "/admin/product/baseTrademark",
  list = "/admin/product/baseTrademark/getTrademarkList";
  add = "/admin/product/baseTrademark/save",
  update = "/admin/product/baseTrademark/update",
  delete = "/admin/product/baseTrademark/remove/"
}

/**
 * 以分页的形式后去品牌列表数据
 * @param page 当前页
 * @param limit 每页显示的条数
 * @returns IResTrademark
 */
export const getTradeMarks = async (page = 1, limit = 5) => {
  return await request.get<any, IResTrademark>(
    `${Apis.pageList}/${page}/${limit}`
  );
};

/**
 * 获取所有的品牌数据
 * @returns 
 */
export const getTradeMarksNoPager = async () => {
  return await request.get<any, ITrademark[]>(Apis.list);
};

/**
 * 添加 品牌数据
 * @param data 品牌数据
 * @returns 
 */
export const addTrademark = async (data: Omit<ITrademark, 'id'>) => {
  return await request.post(Apis.add, data);
}

/**
 * 编辑指定的 品牌数据
 * @param data 要编辑的品牌数据
 * @returns 
 */
export const updateTrademark = async (data: ITrademark) => {
  return await request.put(Apis.update, data);
}


/**
 * 删除指定的品牌
 * @param id 要删除的品牌 id
 * @returns 
 */
export const deleteTrademark =async (id: number) => {
  return await request.delete(Apis.delete + id);
}
