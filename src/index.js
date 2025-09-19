import './cssReset.css';
import './basicStyles.css';
import './sidebar/sidebar.css';

import { DomStuff, ToDoItem } from './domStuff/domStuff.js';
import { SidebarCategory } from './sidebar/sidebar.js';
import { differenceInCalendarDays, format, parse } from 'date-fns';

const processor = (function () {
  let arrays = {
    todoAll: [],
    favorites: [],
    completed: [],
    uncompleted: [],
    dueTmrw: [],
  };

  let initCategories = {
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

  let userCategories = {};

  const currentDay = new Date();
  const checkDueTmrw = (item) => {
    const date = parse(item.getDate(), 'dd/MM/yyyy', currentDay);
    if (differenceInCalendarDays(date, currentDay) === 1) {
      arrays.dueTmrw.push(item);
    }
  };

  const content = document.querySelector('#content');

  const sideBar = DomStuff.makeDiv('#sidebar');
  content.appendChild(sideBar);

  const todos = DomStuff.makeDiv('.todos');
  content.appendChild(todos);

  const saveObjectToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const buildFromStorage = () => {
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        let parsedObj = JSON.parse(localStorage[key]);
        console.log(parsedObj);
        for (let i = 0; i < parsedObj.contents.length; i++) {
          const currObj = parsedObj.contents[i]; // to get the properties easier
          const toDoObj = DomStuff.createToDoItem(
            currObj.text,
            currObj.date,
            currObj.desc
          );

          parsedObj.contents[i] = new ToDoItem(
            toDoObj.todo,
            currObj.text,
            currObj.date,
            false,
            false,
            currObj.parent,
            currObj.desc
          );

          arrays.todoAll.push(parsedObj.contents[i]);
          arrays.uncompleted.push(parsedObj.contents[i]);
          checkDueTmrw(parsedObj.contents[i]);

          if (currObj.check) {
            parsedObj.contents[i].toggleCheck();
            toDoObj.todo.querySelector('.todoCheck').checked = true;
            arrays.completed.push(parsedObj.contents[i]);

            let index = arrays.uncompleted.indexOf(parsedObj.contents[i]);
            if (index !== -1) {
              arrays.uncompleted.splice(index, 1);
            }
          }
          if (currObj.favorite) {
            parsedObj.contents[i].toggleFavorite();
            toDoObj.todo
              .querySelector('.todoFavorite')
              .classList.add('visible');
            arrays.favorites.push(parsedObj.contents[i]);
          }

          toDoObj.todo.querySelector('.parentText ').textContent =
            currObj.parent;

          addClickEventBtn(toDoObj, parsedObj.contents[i], currObj.desc);
        }
        parsedObj = new SidebarCategory(
          parsedObj.name,
          parsedObj.displayName,
          parsedObj.contents,
          parsedObj.canAdd,
          parsedObj.icon
        );

        arrays[parsedObj.name] = parsedObj.contents;
        userCategories[parsedObj.name] = parsedObj;

        userCategoriesDiv.appendChild(parsedObj.getButton());
      }
    }
  };

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
        const formDate = format(new Date(data.get('dateInput')), 'dd/MM/yyyy');
        const formDesc = data.get('descInput');

        const toDoObj = DomStuff.createToDoItem(formText, formDate, formDesc);
        const toDoClass = new ToDoItem(
          toDoObj.todo,
          formText,
          formDate,
          false,
          false,
          currentPage.getName(),
          formDesc
        );

        toDoObj.todo.querySelector('.parentText ').textContent =
          toDoClass.getParent();

        checkDueTmrw(toDoClass);

        addClickEventBtn(toDoObj, toDoClass, formDesc);

        todos.removeChild(form);
        todos.insertBefore(toDoObj.todo, btn);

        arrays.uncompleted.push(toDoClass);
        arrays.todoAll.push(toDoClass);
        currentPage.getContents().push(toDoClass);

        saveObjectToLocalStorage(
          toDoClass.getParent(),
          Object.values(userCategories).find(
            (c) => c.getName() === toDoClass.getParent()
          )
        );
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

        userCategories[textContent] = new SidebarCategory(
          textContent,
          textContent,
          (arrays[textContent] = []),
          true,
          icon
        );

        form.remove();

        saveObjectToLocalStorage(textContent, userCategories[textContent]);

        const newCategoryBtn = userCategories[textContent].getButton();
        userCategoriesDiv.insertBefore(newCategoryBtn, btn);
      });
    });

    return btn;
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

  const addClickEventBtn = (toDoObj, toDoClass, formDesc) => {
    toDoObj.todo.addEventListener('click', (event) => {
      if (formDesc) {
        const element = !event.target.classList.contains('todo')
          ? undefined
          : event.target.closest('.todo');

        if (element && element.classList.contains('clicked')) {
          element.classList.remove('clicked');
        } else if (element) {
          element.classList.add('clicked');
        }
      }
      todoBtnClickEvents(event, toDoObj, toDoClass);
    });
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

      saveObjectToLocalStorage(
        toDoItem.getParent(),
        Object.values(userCategories).find(
          (c) => c.getName() === toDoItem.getParent()
        )
      );
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

      saveObjectToLocalStorage(
        toDoItem.getParent(),
        Object.values(userCategories).find(
          (c) => c.getName() === toDoItem.getParent()
        )
      );
    } else if (event.target.classList.contains('todoDelete')) {
      toDoDOM.remove();

      Object.values(arrays).forEach((element) => {
        const i = element.indexOf(toDoItem);
        if (i > -1) element.splice(i, 1);
      });
      saveObjectToLocalStorage(
        toDoItem.getParent(),
        Object.values(userCategories).find(
          (c) => c.getName() === toDoItem.getParent()
        )
      );
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

    Object.values(initCategories).forEach((item) => {
      basicsDiv.appendChild(item.getButton());
    });
  };

  const getClickedCategory = (categories, btn) => {
    const name = btn.getAttribute('buttonName');
    return Object.values(categories).find((c) => c.getName() === name);
  };

  const initSideBar = () => {
    currentPage.getButton().classList.add('clicked');

    initBasicsSideBar();
    initUserSideBar();

    sideBar.addEventListener('click', (event) => {
      const btn = event.target.closest('button.categoryButton');
      if (!btn) return;

      const categoryBtns = [...document.querySelectorAll('.categoryButton')];

      for (const key in categoryBtns) {
        categoryBtns[key].classList.remove('clicked');
      }

      const clickedCategory =
        getClickedCategory(userCategories, btn) ||
        getClickedCategory(initCategories, btn);

      if (clickedCategory) {
        changePage(clickedCategory);
      }

      btn.classList.add('clicked');
    });
  };

  const startApp = () => {
    buildFromStorage();
    changePage(initCategories.dueTmrwCategory);
    initSideBar();
  };

  startApp();
})();
