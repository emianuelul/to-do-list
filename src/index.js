import './cssReset.css';
import './basicStyles.css';

import { DomStuff } from './domStuff/domStuff.js';

const processor = (function () {
  let toDoItems = [];
  let favorites = [];
  let completed = [];
  let uncompleted = [];

  const content = document.querySelector('#content');

  const initPage = () => {
    const div = DomStuff.makeDiv('.todos');
    const btn = DomStuff.makeButton('+');
    const h1 = DomStuff.makeH(1, 'Title');
    btn.classList.add('addToDo');

    btn.addEventListener('click', (event) => {
      const form = DomStuff.createToDoForm();

      div.insertBefore(form, btn);

      form.addEventListener('click', (event) => {
        if (event.target.classList.contains('cancelBtn')) {
          div.removeChild(form);
        }
      });

      form.addEventListener('submit', (event) => {
        event.preventDefault();

        const toDoObj = DomStuff.createToDoItem(form);
        const favoriteBtn = toDoObj.todo.children[2];
        const todoItem = toDoObj.item;
        div.removeChild(form);

        div.insertBefore(toDoObj.todo, btn);

        toDoObj.todo.addEventListener('click', (event) => {
          if (event.target.classList.contains('todoCheck')) {
            todoItem.toggleCheck();
            if (todoItem.isChecked()) {
              completed.push(todoItem);
              uncompleted = uncompleted.filter((item) => item !== todoItem);
            } else {
              completed = completed.filter((item) => item !== todoItem);
              uncompleted.push(todoItem);
            }
          } else if (event.target.classList.contains('todoFavorite')) {
            todoItem.toggleFavorite();
            if (todoItem.isFavorite()) {
              favorites.push(todoItem);
              favoriteBtn.classList.add('visible');
            } else {
              favorites = favorites.filter((item) => item !== todoItem);
              favoriteBtn.classList.remove('visible');
            }
          }
        });

        uncompleted.push(todoItem);
        toDoItems.push(todoItem);
      });
    });

    div.appendChild(h1);
    div.appendChild(btn);
    content.appendChild(div);
  };

  const logArrays = () => {
    console.log({ favorites });
    console.log({ toDoItems });
  };

  initPage();
})();
