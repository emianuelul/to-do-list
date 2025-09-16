import './cssReset.css';
import './basicStyles.css';

import { DomStuff } from './domStuff/domStuff.js';

const processor = (function () {
  let basics = { todoAll: [], favorites: [], completed: [], uncompleted: [] };

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

        const data = new FormData(form);
        const formText = data.get('textInput');
        const formDate = data.get('dateInput');

        const toDoObj = DomStuff.createToDoItem(formText, formDate);
        const favoriteBtn = toDoObj.todo.querySelector('.todoFavorite');
        const deleteBtn = toDoObj.todo.querySelector('.todoDelete');
        const todoDOM = toDoObj.todo;
        const todoItem = toDoObj.item;

        div.removeChild(form);
        div.insertBefore(todoDOM, btn);

        todoDOM.addEventListener('click', (event) => {
          if (event.target.classList.contains('todoCheck')) {
            todoItem.toggleCheck();
            if (todoItem.isChecked()) {
              basics.completed.push(todoItem);
              basics.uncompleted = basics.uncompleted.filter(
                (item) => item !== todoItem
              );
            } else {
              basics.completed = basics.completed.filter(
                (item) => item !== todoItem
              );
              basics.uncompleted.push(todoItem);
            }
          } else if (event.target.classList.contains('todoFavorite')) {
            todoItem.toggleFavorite();
            if (todoItem.isFavorite()) {
              basics.favorites.push(todoItem);
              favoriteBtn.classList.add('visible');
            } else {
              basics.favorites = basics.favorites.filter(
                (item) => item !== todoItem
              );
              favoriteBtn.classList.remove('visible');
            }
          } else if (event.target.classList.contains('todoDelete')) {
            div.removeChild(todoDOM);

            Object.keys(basics).forEach((key) => {
              basics[key] = basics[key].filter((item) => item !== todoItem);
            });
          }
        });

        basics.uncompleted.push(todoItem);
        basics.todoAll.push(todoItem);
      });
    });

    div.appendChild(h1);
    div.appendChild(btn);

    content.appendChild(div);
  };

  initPage();
})();
