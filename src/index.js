import './cssReset.css';
import './basicStyles.css';
import './sidebar/sidebar.css';

import { DomStuff } from './domStuff/domStuff.js';
import { SidebarCategory } from './sidebar/sidebar.js';
import { differenceInCalendarDays } from 'date-fns';

/*
  TO DO:
  1. Make app have persistent storage
  2. Make add button more modular (don't create a different button each time you change pages, keep the button through a refference and just move it around)
 */

const processor = (function () {
  let basics = {
    todoAll: [],
    favorites: [],
    completed: [],
    uncompleted: [],
    dueTmrw: [],
  };

  let categories = {
    dueTmrwCategory: new SidebarCategory(
      'duetmrw',
      'Due Tomorrow',
      basics.dueTmrw,
      false
    ),
    allTodosCategory: new SidebarCategory(
      'alltodos',
      "All <span class='nowrap'>To-Do's</span>",
      basics.todoAll,
      false
    ),
    favoritesCategory: new SidebarCategory(
      'favorites',
      'Favorites',
      basics.favorites,
      false
    ),
    completedCategory: new SidebarCategory(
      'completed',
      "Completed <span class='nowrap'>To-Do's</span>",
      basics.completed,
      false
    ),
    uncompletedCategory: new SidebarCategory(
      'uncompleted',
      "Uncompleted <span class='nowrap'>To-Do's</span>",
      basics.uncompleted,
      false
    ),
  };

  const currentDay = new Date();

  const content = document.querySelector('#content');

  const sideBar = DomStuff.makeDiv('#sidebar');
  content.appendChild(sideBar);

  const todos = DomStuff.makeDiv('.todos');
  content.appendChild(todos);

  const createAddToDoBtn = () => {
    const btn = DomStuff.makeButton('+');
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

        checkDueTmrw(toDoObj.item);

        todos.removeChild(form);
        todos.insertBefore(toDoObj.todo, btn);

        toDoObj.todo.addEventListener('click', (event) =>
          todoBtnClickEvents(event, toDoObj)
        );

        basics.uncompleted.push(toDoObj.item);
        basics.todoAll.push(toDoObj.item);
        currentPage.getContents().push(toDoObj.item);
      });
    });
    todos.appendChild(btn);

    return btn;
  };

  const userCategoriesDiv = DomStuff.makeDiv('#userCategories');
  const initUserSideBar = () => {
    createAddCategoryBtn();

    userCategoriesDiv.classList.add('sidebarSection');
    sideBar.appendChild(userCategoriesDiv);

    userCategoriesDiv.appendChild(addCategoryBtn);
  };

  const createAddCategoryBtn = () => {
    const btn = DomStuff.makeButton('+');
    btn.id = 'addCategory';

    btn.addEventListener('click', (event) => {
      const form = DomStuff.createCategoryForm();

      userCategoriesDiv.insertBefore(form, btn);

      form.addEventListener('click', (event) => {
        if (event.target.classList.contains('cancelCtgBtn')) {
          form.remove();
        }
      });

      form.addEventListener('submit', (event) => {
        event.preventDefault();

        const data = new FormData(form);
        const textContent = data.get('textInput');
        const icon = data.get('iconInput');

        categories[textContent] = new SidebarCategory(
          textContent,
          textContent,
          [],
          true,
          icon
        );

        form.remove();

        const newCategoryBtn = categories[textContent].getButton();
        userCategoriesDiv.insertBefore(newCategoryBtn, btn);
      });
    });

    return btn;
  };

  const checkDueTmrw = (item) => {
    if (differenceInCalendarDays(item.getDate(), currentDay) === 1) {
      basics.dueTmrw.push(item);
    }
  };

  const createToDos = (array) => {
    array.forEach((item) => {
      const object = item.getNode();
      if (document.querySelector('.addToDo') !== undefined)
        todos.insertBefore(item.getNode(), document.querySelector('.addToDo'));
      else todos.appendChild(item.getNode());
    });
  };

  const belongsToPage = (todoItem, page) => {
    switch (page.getName()) {
      case 'completed':
        return todoItem.isChecked();
      case 'uncompleted':
        return !todoItem.isChecked();
      case 'favorites':
        return todoItem.isFavorite();
      case 'alltodos':
      default:
        return true;
    }
  };

  const todoBtnClickEvents = (event, todoObj) => {
    const favoriteBtn = todoObj.todo.querySelector('.todoFavorite');
    const todoDOM = todoObj.todo;
    const todoItem = todoObj.item;

    if (event.target.classList.contains('todoCheck')) {
      todoItem.toggleCheck();

      if (todoItem.isChecked()) {
        basics.completed.push(todoItem);

        let index = basics.uncompleted.indexOf(todoItem);
        if (index !== -1) {
          basics.uncompleted.splice(index, 1);
        }
      } else {
        basics.uncompleted.push(todoItem);

        let index = basics.completed.indexOf(todoItem);
        if (index !== -1) {
          basics.completed.splice(index, 1);
        }
      }

      if (currentPage && !belongsToPage(todoItem, currentPage)) {
        todoDOM.remove();
      }
    } else if (event.target.classList.contains('todoFavorite')) {
      if (favoriteBtn.classList.contains('visible')) {
        todoItem.toggleFavorite();
        favoriteBtn.classList.remove('visible');
        const i = basics.favorites.indexOf(todoItem);
        if (i !== -1) basics.favorites.splice(i, 1);
      } else {
        todoItem.toggleFavorite();
        favoriteBtn.classList.add('visible');
        basics.favorites.push(todoItem);
      }

      if (currentPage && !belongsToPage(todoItem, currentPage)) {
        todoDOM.remove();
      }
    } else if (event.target.classList.contains('todoDelete')) {
      todoDOM.remove();

      Object.values(basics).forEach((element) => {
        const i = element.indexOf(todoItem);
        element.splice(i, 1);
      });
    }
  };

  let currentPage = null;
  const addToDoBtn = createAddToDoBtn();
  const changePage = (page) => {
    currentPage = page;
    console.log('Current Page Name: ' + currentPage.getName());

    todos.innerHTML = '';
    const h1 = DomStuff.makeH(1, page.getDisplayName());
    h1.classList.add('sectionTitle');

    todos.appendChild(h1);

    if (page.getCanAdd()) {
      todos.appendChild(addToDoBtn);
    }
    createToDos(page.getContents());
  };

  const addCategoryBtn = createAddCategoryBtn();
  const initBasicsSideBar = () => {
    const basicsDiv = DomStuff.makeDiv('#basics');
    basicsDiv.classList.add('sidebarSection');
    sideBar.appendChild(basicsDiv);

    Object.values(categories).forEach((item) => {
      basicsDiv.appendChild(item.getButton());
    });
  };

  const initSideBar = () => {
    currentPage.getButton().classList.add('clicked');

    initBasicsSideBar();
    initUserSideBar();

    sideBar.addEventListener('click', (event) => {
      const btn = event.target.closest('button.categoryButton');
      if (!btn) return;

      for (const key in categories) {
        categories[key].getButton().classList.remove('clicked');
      }

      const name = btn.getAttribute('buttonName');
      let clickedCategory = Object.values(categories).find(
        (c) => c.getName() === name
      );

      if (clickedCategory) {
        changePage(clickedCategory);
      }

      console.log(clickedCategory);

      btn.classList.add('clicked');
    });
  };

  const startApp = () => {
    changePage(categories.dueTmrwCategory);
  };

  startApp();
  initSideBar();
})();
