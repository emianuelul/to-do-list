import { DomStuff } from '../domStuff/domStuff';

export class SidebarCategory {
  constructor(name, displayName, contents, canAdd, icon = '') {
    this.name = name;
    this.displayName = displayName;
    this.contents = contents;
    this.icon = icon;
    this.canAdd = canAdd;

    const button = DomStuff.makeButton(displayName);
    button.classList.add('categoryButton');
    this.button = button;

    this.button.setAttribute('buttonName', name);
  }

  getCanAdd() {
    return this.canAdd;
  }

  getName() {
    return this.name;
  }

  getDisplayName() {
    return this.displayName;
  }

  getContents() {
    return this.contents;
  }

  getButton() {
    return this.button;
  }
}
