export class ToDoItem {
  constructor(node, text, date, check, favorite, parent, desc = '') {
    this.node = node;

    this.text = text;
    this.date = date;
    this.parent = parent;
    this.desc = desc;

    this.check = check;
    this.favorite = favorite;
  }

  getText() {
    return this.text;
  }

  setText(text) {
    this.text = text;
  }

  getDate() {
    return this.date;
  }

  getNode() {
    return this.node;
  }

  getParent() {
    return this.parent;
  }

  setParent(parentName) {
    this.parent = parentName;
    this.node.querySelector('.parentText').innerText = parentName;
  }

  toggleCheck() {
    const label = this.node.querySelector('.todoText');
    this.check = !this.check;

    if (this.check === true) label.classList.add('strikethrough');
    else label.classList.remove('strikethrough');
  }

  toggleFavorite() {
    this.favorite = !this.favorite;
  }

  isChecked() {
    return this.check === true;
  }

  isFavorite() {
    return this.favorite === true;
  }
}

export class DomStuff {
  static #labels = 1;

  static makeDiv(selector) {
    const div = document.createElement('div');
    if (selector[0] === '#') {
      div.id = selector.slice(1);
    } else if (selector[0] === '.') {
      div.classList.add(selector.slice(1));
    } else {
      console.error('first character is not a class / id selector');
    }
    return div;
  }

  static makeButton(text) {
    const btn = document.createElement('button');
    btn.innerHTML = text;
    btn.type = 'button';
    return btn;
  }

  static makeLabel(forValue, text) {
    const label = document.createElement('label');
    label.setAttribute('for', forValue);
    label.textContent = text;
    return label;
  }

  static makeCheckbox(id) {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    return input;
  }

  static makeInput(type, required) {
    const input = document.createElement('input');
    input.type = type;
    if (required) input.setAttribute('required', '');
    return input;
  }

  static makeH(type, text) {
    const h = document.createElement(`h${type}`);
    h.innerHTML = text;

    return h;
  }

  static makeP(text) {
    const p = document.createElement('p');
    p.textContent = text;

    return p;
  }

  static createPageTitle(titleText) {
    const container = DomStuff.makeDiv('.titleContainer');
    const title = DomStuff.makeH(1, titleText);
    title.classList.add('sectionTitle');
    const deleteButton = DomStuff.makeButton('🗑️');
    deleteButton.classList.add('sectionDelete');

    container.append(title, deleteButton);

    return container;
  }

  static createToDoForm() {
    const form = document.createElement('form');
    form.classList.add('todoform');

    const textInput = DomStuff.makeInput('text', true);
    textInput.name = 'textInput';
    textInput.placeholder = 'Name...';

    const dateInput = DomStuff.makeInput('text', true);
    dateInput.name = 'dateInput';
    dateInput.placeholder = 'dd/mm/yyyy';
    dateInput.setAttribute('onfocus', '(this.type="date")');
    dateInput.setAttribute('onblur', '(this.type="text")');

    const submitButton = DomStuff.makeButton('Submit');
    submitButton.type = 'submit';

    const cancelBtn = DomStuff.makeButton('x');
    cancelBtn.classList.add('cancelBtn');
    cancelBtn.type = 'button';

    const desc = DomStuff.makeInput('text', false);
    desc.name = 'descInput';
    desc.id = desc.name;
    desc.classList.add('todoDescForm');
    desc.placeholder = 'Description... (optional)';

    form.append(cancelBtn, textInput, dateInput, submitButton, desc);

    return form;
  }

  static createToDoItem(text, date, desc) {
    const todo = DomStuff.makeDiv('.todo');

    const checkBox = DomStuff.makeCheckbox(`${DomStuff.#labels}`);
    checkBox.classList.add('todoCheck');

    const label = DomStuff.makeP(text);
    label.classList.add('todoText');

    const dateLabel = DomStuff.makeP(date);
    dateLabel.classList.add('todoDate');
    DomStuff.#labels++;

    const parent = DomStuff.makeP();
    parent.classList.add('parentText');

    const favoriteBtn = DomStuff.makeButton('⭐');
    favoriteBtn.classList.add('todoFavorite');

    const deleteBtn = DomStuff.makeButton('🗑️');
    deleteBtn.classList.add('todoDelete');

    const description = DomStuff.makeP(desc);
    description.classList.add('todoDesc');

    todo.append(
      checkBox,
      label,
      dateLabel,
      parent,
      favoriteBtn,
      deleteBtn,
      description
    );

    if (!desc) {
      description.remove();
    }

    return {
      todo,
    };
  }

  static createCategoryForm() {
    const form = document.createElement('form');
    form.classList.add('categoryForm');

    const textInput = DomStuff.makeInput('text', true);
    textInput.name = 'textInput';
    textInput.id = 'textInput';

    const textLabel = DomStuff.makeLabel(textInput.id, 'Category Name: ');

    const iconInput = DomStuff.makeInput('text', false);
    iconInput.name = 'iconInput';
    iconInput.id = 'iconInput';

    iconInput.addEventListener('input', () => {
      iconInput.value = iconInput.value.match(/\p{Emoji}/gu)?.join('') ?? '';
    });

    const iconLabel = DomStuff.makeLabel(iconInput.id, 'Icon: ');

    const submitButton = DomStuff.makeButton('Create');
    submitButton.type = 'submit';

    const cancelBtn = DomStuff.makeButton('x');
    cancelBtn.classList.add('cancelCtgBtn');
    cancelBtn.type = 'button';

    form.append(
      cancelBtn,
      iconLabel,
      iconInput,
      textLabel,
      textInput,
      submitButton
    );

    return form;
  }
}
