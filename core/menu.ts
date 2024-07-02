export interface IMenuItem {
  key: string;
  label: string;
}
export class Menu {
  private items: IMenuItem[] = [];
  constructor(items: IMenuItem[]) {
    this.items = items;
  }
  serialize(): string {
    return this.items.reduce((str, item) => {
      if (str) {
        str += "\n";
      }
      str += `${item.key}.\t${item.label}`;
      return str;
    }, "");
  }
  getItem(key: string) {
    return this.items.find((i) => i.key === key) || null;
  }
}
