import { defineStore } from "pinia";
import * as apis from '@/api/category';

import type {IAttrStore} from './interface/category';

export const useAttrStore = defineStore('attrStore', {
    state(): IAttrStore {
        return {
            category1Id: '',
            category2Id: '',
            category3Id: '',

            categories1: [],
            categories2: [],
            categories3: []
        }
    },

    actions: {
        async getCategories1() {
            try {
                const res = await apis.getCategories1();
                // console.log(res);
                // 把获取到的数据存储到仓库 state 中
                this.categories1 = res;
            } catch(e) {
            }
        },

        async getCategories2() {
            try {
                //  先清除分类二和分类三的数据（是在分类一被重新选择的时候，分类一重新被选择调用是 getCategories2，所以是在这里清除 ）
                this.category2Id = this.category3Id = '';
                this.categories2 = this.categories3 = [];

                const res = await apis.getCategories2(this.category1Id);
                // console.log(res);
                // 把获取到的数据存储到仓库 state 中
                this.categories2 = res;
            } catch(e) {
            }
        },

        async getCategories3() {
            try {
                //  先清除分类三（是在分类二被重新选择的时候，分类二重新被选择调用是 getCategories3，所以是在这里清除 ）
                this.category3Id = '';
                this.categories3 = [];

                const res = await apis.getCategories3(this.category2Id);
                // console.log(res);
                // 把获取到的数据存储到仓库 state 中
                this.categories3 = res;
            } catch(e) {
            }
        }
    }
});