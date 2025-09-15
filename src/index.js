import './cssReset.css';
import './basicStyles.css';

const content = document.querySelector('#content');
const todos = document.querySelector('.todos');
const addButton = document.querySelector('.addToDo');

class DomStuff {
  static #labels = 1;

  static makeDiv(text) {
    const div = document.createElement('div');
    if (text[0] === '#') {
      div.id = text.slice(1);
    } else {
      div.classList.add(text.slice(1));
    }
    return div;
  }

  static makeButton(text) {
    const btn = document.createElement('button');
    btn.textContent = text;
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
    cancelButton.type = 'button';
    cancelButton.addEventListener('click', () => {
      todos.removeChild(form);
    });

    form.append(cancelButton, textInput, dateInput, submitButton);
    todos.insertBefore(form, addButton);

    return new Promise((resolve) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();

        const toDoItem = DomStuff.#createToDoItem(form);
        todos.removeChild(form);

        resolve(toDoItem);
      });

      form.addEventListener('keyup', (event) => {
        if (event.key === 'Enter' && !event.repeat && form.checkValidity()) {
          form.requestSubmit();
        }
      });
    });
  }

  static #createToDoItem(form) {
    const data = new FormData(form);
    const text = data.get('textInput');
    const date = data.get('dateInput');

    const todo = DomStuff.makeDiv('.todo');
    const checkBox = DomStuff.makeCheckbox(`${DomStuff.#labels}`);
    const label = DomStuff.makeLabel(`${DomStuff.#labels}`, text);
    DomStuff.#labels++;

    const item = new ToDoItem(todo, text, date, checkBox.checked, false);

    checkBox.addEventListener('change', () => {
      item.toggleCheck();
    });

    todo.append(checkBox, label);
    todos.insertBefore(todo, addButton);

    return item;
  }
}

class ToDoItem {
  constructor(node, text, date, check, favorite) {
    this.node = node;
    this.text = text;
    this.date = date;
    this.check = check;
    this.favorite = favorite;
  }

  toggleCheck() {
    this.check = !this.check;
  }

  toggleFavorite() {
    this.favorite = !this.favorite;
  }
}

const processor = (function () {
  let toDoItems = [];

  addButton.addEventListener('click', () =>
    DomStuff.createToDoForm().then((item) => {
      toDoItems.push(item);
    })
  );
})();
