import { CategoryInterface } from "./category.interface";

export interface ItemInterface {
  id: string,
  code: string,
  name: string,
  description: string,
  category: CategoryInterface

}
