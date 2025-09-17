class ToDoItem {
  constructor(node, text, date, check, favorite) {
    this.node = node;
    this.text = text;
    this.date = date;
    this.check = check;
    this.favorite = favorite;
  }

  getText() {
    return this.text;
  }

  getDate() {
    return this.date;
  }

  getNode() {
    return this.node;
  }

  toggleCheck() {
    const label = this.node.querySelector('.todoLabel');
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

  static createToDoForm() {
    const form = document.createElement('form');
    form.classList.add('todoform');

    const textInput = DomStuff.makeInput('text', true);
    textInput.name = 'textInput';

    const dateInput = DomStuff.makeInput('date', true);
    dateInput.name = 'dateInput';

    const submitButton = DomStuff.makeButton('Submit');
    submitButton.type = 'submit';

    const cancelButton = DomStuff.makeButton('x');
    cancelButton.classList.add('cancelBtn');
    cancelButton.type = 'button';

    form.append(cancelButton, textInput, dateInput, submitButton);

    return form;
  }

  static createToDoItem(text, date) {
    const todo = DomStuff.makeDiv('.todo');

    const checkBox = DomStuff.makeCheckbox(`${DomStuff.#labels}`);
    checkBox.classList.add('todoCheck');

    const label = DomStuff.makeLabel(`${DomStuff.#labels}`, text);
    label.classList.add('todoLabel');

    const dateLabel = DomStuff.makeLabel(`${DomStuff.#labels}`, date);
    dateLabel.classList.add('todoDate');
    DomStuff.#labels++;

    const favoriteBtn = DomStuff.makeButton('⭐');
    favoriteBtn.classList.add('todoFavorite');

    const deleteBtn = DomStuff.makeButton('🗑️');
    deleteBtn.classList.add('todoDelete');

    const item = new ToDoItem(todo, text, date, checkBox.checked, false);

    todo.append(checkBox, label, dateLabel, favoriteBtn, deleteBtn);

    return {
      todo,
      item,
    };
  }
}
