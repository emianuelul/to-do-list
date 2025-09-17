import { DomStuff } from '../domStuff/domStuff';

export class SidebarCategory {
  constructor(name, displayName, contents, canAdd, icon = '') {
    this.name = name;
    this.displayName = displayName;
    this.contents = contents;
    this.icon = icon;
    this.canAdd = canAdd;

    this.node = DomStuff.makeDiv('.sidebarCategory');

    const button = DomStuff.makeButton(displayName);
    button.classList.add('categoryTitle');
    this.node.appendChild(button);

    this.node.id = name;
  }

  getName() {
    return this.name;
  }

  getContents() {
    return this.contents;
  }

  getNode() {
    return this.node;
  }

  getCanAdd() {
    return this.canAdd;
  }
}
