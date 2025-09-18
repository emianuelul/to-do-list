import './cssReset.css';
import './basicStyles.css';
import './sidebar/sidebar.css';

import { DomStuff, ToDoItem } from './domStuff/domStuff.js';
import { SidebarCategory } from './sidebar/sidebar.js';
import { differenceInCalendarDays } from 'date-fns';

/*
  TO DO:
  1. Make app have persistent storage
 */

const processor = (function () {
  let arrays = {
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
      arrays.dueTmrw,
      false
    ),
    allTodosCategory: new SidebarCategory(
      'alltodos',
      "All <span class='nowrap'>To-Do's</span>",
      arrays.todoAll,
      false
    ),
    favoritesCategory: new SidebarCategory(
      'favorites',
      'Favorites',
      arrays.favorites,
      false
    ),
    completedCategory: new SidebarCategory(
      'completed',
      "Completed <span class='nowrap'>To-Do's</span>",
      arrays.completed,
      false
    ),
    uncompletedCategory: new SidebarCategory(
      'uncompleted',
      "Uncompleted <span class='nowrap'>To-Do's</span>",
      arrays.uncompleted,
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
        const toDoClass = new ToDoItem(
          toDoObj.todo,
          formText,
          formDate,
          false,
          false,
          currentPage.getName()
        );

        toDoObj.todo.querySelector('p').textContent =
          '< ' + toDoClass.getParent();

        checkDueTmrw(toDoClass);

        todos.removeChild(form);
        todos.insertBefore(toDoObj.todo, btn);

        toDoObj.todo.addEventListener('click', (event) =>
          todoBtnClickEvents(event, toDoObj, toDoClass)
        );

        arrays.uncompleted.push(toDoClass);
        arrays.todoAll.push(toDoClass);
        currentPage.getContents().push(toDoClass);
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
          (arrays[textContent] = []),
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
      arrays.dueTmrw.push(item);
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

  const belongsToPage = (toDoItem, page) => {
    switch (page.getName()) {
      case 'completed':
        return toDoItem.isChecked();
      case 'uncompleted':
        return !toDoItem.isChecked();
      case 'favorites':
        return toDoItem.isFavorite();
      case 'alltodos':
      default:
        return true;
    }
  };

  const todoBtnClickEvents = (event, toDoObj, item) => {
    const favoriteBtn = toDoObj.todo.querySelector('.todoFavorite');
    const toDoDOM = toDoObj.todo;
    const toDoItem = item;

    if (event.target.classList.contains('todoCheck')) {
      toDoItem.toggleCheck();

      if (toDoItem.isChecked()) {
        arrays.completed.push(toDoItem);

        let index = arrays.uncompleted.indexOf(toDoItem);
        if (index !== -1) {
          arrays.uncompleted.splice(index, 1);
        }
      } else {
        arrays.uncompleted.push(toDoItem);

        let index = arrays.completed.indexOf(toDoItem);
        if (index !== -1) {
          arrays.completed.splice(index, 1);
        }
      }

      if (currentPage && !belongsToPage(toDoItem, currentPage)) {
        toDoDOM.remove();
      }
    } else if (event.target.classList.contains('todoFavorite')) {
      if (favoriteBtn.classList.contains('visible')) {
        toDoItem.toggleFavorite();
        favoriteBtn.classList.remove('visible');
        const i = arrays.favorites.indexOf(toDoItem);
        if (i !== -1) arrays.favorites.splice(i, 1);
      } else {
        toDoItem.toggleFavorite();
        favoriteBtn.classList.add('visible');
        arrays.favorites.push(toDoItem);
      }

      if (currentPage && !belongsToPage(toDoItem, currentPage)) {
        toDoDOM.remove();
      }
    } else if (event.target.classList.contains('todoDelete')) {
      toDoDOM.remove();

      Object.values(arrays).forEach((element) => {
        const i = element.indexOf(toDoItem);
        if (i > -1) element.splice(i, 1);
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
