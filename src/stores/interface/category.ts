import type {ICategory} from '@/types/app';

export interface IAttrStore {
    category1Id: string;
    category2Id: string;
    category3Id: string;

    categories1: ICategory[];
    categories2: ICategory[];
    categories3: ICategory[];
}