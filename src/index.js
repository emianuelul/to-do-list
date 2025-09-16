import './cssReset.css';
import './basicStyles.css';

import { DomStuff } from './domStuff/domStuff.js';

const processor = (function () {
  let toDoItems = [];
  let favorites = [];

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
        div.removeChild(form);

        div.insertBefore(toDoObj.todo, btn);

        toDoObj.todo.addEventListener('mouseenter', () => {
          favoriteBtn.classList.add('visible');
        });
        toDoObj.todo.addEventListener('mouseleave', () => {
          favoriteBtn.classList.remove('visible');
        });
        toDoObj.todo.addEventListener('click', (event) => {
          if (event.target.classList.contains('todoCheck')) {
            toDoObj.item.toggleCheck();
          } else if (event.target.classList.contains('todoFavorite')) {
            toDoObj.item.toggleFavorite();
          }
        });
      });
    });

    div.appendChild(h1);
    div.appendChild(btn);
    content.appendChild(div);
  };

  initPage();
})();
