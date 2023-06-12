export interface ResPager<T> {
  /**
     * 当前页码
     */
  current: number;
  /**
   * 总页码数
   */
  pages: number;
  /**
   * 品牌数组
   */
  records: T[];
  /**
   * 是否搜索记录
   */
  searchCount: boolean;
  /**
   * 每页显示记录条数
   */
  size: number;
  /**
   * 总记录条数
   */
  total: number;
}


export interface LoginUserResponseData {
  token: string;
}

export interface UserInfoData {
  name: string;
  avatar: string;
}

export interface IResTrademark extends ResPager<ITrademark> {
}

export interface ITrademark {
  /**
   * 品牌ID
   */
  id: number;
  /**
   * 品牌LOGO地址
   */
  logoUrl: string;
  /**
   * 品牌名称
   */
  tmName: string;
}


/**
 * 分类列表
 */
export interface ICategory {
  /**
   * 分类ID
   */
  id: number;
  /**
   * 分类名称
   */
  name: string;
}

/**
 * 平台属性
 */

export interface IAttr {
  /**
   * 平台属性名称
   */
  attrName: string;
  /**
   * 平台属性值的集合
   */
  attrValueList: IAttrValueList[];
  /**
   * 平台属性所属分类ID
   */
  categoryId: number;
  /**
   * 平台属性所属分类等级
   */
  categoryLevel: number;
  /**
   * 平台属性ID
   */
  id: number;
}

export interface IAttrValueList {
  /**
   * 平台属性值所属的属性ID
   */
  attrId: number;
  /**
   * 平台属性值的ID
   */
  id: number;
  /**
   * 平台属性值的名称
   */
  valueName: string;
}


/**
 * SPU
 */





