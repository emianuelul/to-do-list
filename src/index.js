import './cssReset.css';
import './basicStyles.css';
import './sidebar/sidebar.css';

import { DomStuff } from './domStuff/domStuff.js';
import { SidebarCategory } from './sidebar/sidebar.js';

const processor = (function () {
  let basics = { todoAll: [], favorites: [], completed: [], uncompleted: [] };

  const content = document.querySelector('#content');

  const sideBar = DomStuff.makeDiv('#sidebar');
  content.appendChild(sideBar);

  const todos = DomStuff.makeDiv('.todos');
  content.appendChild(todos);

  const changePage = () => {};

  const initSideBar = () => {
    const basicsDiv = DomStuff.makeDiv('#basics');
    basicsDiv.classList.add('sidebarSection');
    sideBar.appendChild(basicsDiv);

    const userProjects = DomStuff.makeDiv('#userProjects');
    userProjects.classList.add('sidebarSection');
    sideBar.appendChild(userProjects);

    const allTodosCategory = new SidebarCategory(
      'all-to-dos',
      "All <span class='nowrap'>To-Do's<span>",
      false,
      basics.todoAll
    );

    const favoritesCategory = new SidebarCategory(
      'favorites',
      'Favorites',
      true,
      basics.favorites
    );

    const completedCategory = new SidebarCategory(
      'completed',
      "Completed <span class='nowrap'>To-Do's<span>",
      false,
      basics.completed
    );

    const uncompletedCategory = new SidebarCategory(
      'uncompleted',
      "Uncompleted <span class='nowrap'>To-Do's<span>",
      false,
      basics.uncompleted
    );

    basicsDiv.append(
      allTodosCategory.getNode(),
      favoritesCategory.getNode(),
      completedCategory.getNode(),
      uncompletedCategory.getNode()
    );
  };

  const initPage = () => {
    const btn = DomStuff.makeButton('+');
    const h1 = DomStuff.makeH(1, "All To-Do's");
    h1.classList.add('sectionTitle');
    btn.classList.add('addToDo');

    btn.addEventListener('click', (event) => {
      const form = DomStuff.createToDoForm();

      todos.insertBefore(form, btn);

      form.addEventListener('click', (event) => {
        if (event.target.classList.contains('cancelBtn')) {
          todos.removeChild(form);
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

        todos.removeChild(form);
        todos.insertBefore(todoDOM, btn);

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
            todos.removeChild(todoDOM);

            Object.keys(basics).forEach((key) => {
              basics[key] = basics[key].filter((item) => item !== todoItem);
            });
          }
        });

        basics.uncompleted.push(todoItem);
        basics.todoAll.push(todoItem);
      });
    });

    todos.appendChild(h1);
    todos.appendChild(btn);
  };

  initPage();
  initSideBar();
})();
