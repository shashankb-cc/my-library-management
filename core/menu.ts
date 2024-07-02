export interface IMenuItem {
  key: string;
  lable: string;
}

export class Menu {
  private items: IMenuItem[] = [];
  constructor(items: IMenuItem[]);
}
