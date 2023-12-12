export interface ContentNode {
  uuid: number;
  parentUuid: number;
  categories?: string;
  name: string;
  path: string;
  parentColl: string;
  tags?: string;
  url?: string;
  banner?: string;
  thumb?: string;
}

export interface ParentChildKV {
  id?: number;
  ch?: Array<number>;
}
