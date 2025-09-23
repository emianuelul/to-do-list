import './cssReset.css';
import './basicStyles.css';
import './sidebar/sidebar.css';

import { DomStuff, ToDoItem } from './domStuff/domStuff.js';
import { SidebarCategory } from './sidebar/sidebar.js';
import { differenceInCalendarDays, format, parse } from 'date-fns';

const processor = (function () {
  let arrays = {
    "All To-Do's": [],
    Favorites: [],
    "Completed To-Do's": [],
    "Uncompleted To-Do's": [],
    'Due Tomorrow': [],
  };

  let initCategories = {
    dueTmrwCategory: new SidebarCategory(
      'Due Tomorrow',
      'Due Tomorrow',
      arrays['Due Tomorrow'],
      false
    ),
    allTodosCategory: new SidebarCategory(
      "All To-Do's",
      "All <span class='nowrap'>To-Do's</span>",
      arrays["All To-Do's"],
      false
    ),
    favoritesCategory: new SidebarCategory(
      'Favorites',
      'Favorites',
      arrays.Favorites,
      false
    ),
    completedCategory: new SidebarCategory(
      "Completed To-Do's",
      "Completed <span class='nowrap'>To-Do's</span>",
      arrays["Completed To-Do's"],
      false
    ),
    uncompletedCategory: new SidebarCategory(
      "Uncompleted To-Do's",
      "Uncompleted <span class='nowrap'>To-Do's</span>",
      arrays["Uncompleted To-Do's"],
      false
    ),
  };

  let userCategories = {};

  const currentDay = new Date();
  const checkDueTmrw = (item) => {
    const date = parse(item.getDate(), 'dd/MM/yyyy', currentDay);
    if (differenceInCalendarDays(date, currentDay) === 1) {
      arrays['Due Tomorrow'].push(item);
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

  const removeObjectFromLocalStorage = (key) => {
    localStorage.removeItem(key);
  };

  const buildFromStorage = () => {
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        let parsedObj = JSON.parse(localStorage[key]);
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

          arrays["All To-Do's"].push(parsedObj.contents[i]);
          arrays["Uncompleted To-Do's"].push(parsedObj.contents[i]);
          checkDueTmrw(parsedObj.contents[i]);

          if (currObj.check) {
            parsedObj.contents[i].toggleCheck();
            toDoObj.todo.querySelector('.todoCheck').checked = true;
            arrays["Completed To-Do's"].push(parsedObj.contents[i]);

            let index = arrays["Uncompleted To-Do's"].indexOf(
              parsedObj.contents[i]
            );
            if (index !== -1) {
              arrays["Uncompleted To-Do's"].splice(index, 1);
            }
          }
          if (currObj.favorite) {
            parsedObj.contents[i].toggleFavorite();
            toDoObj.todo
              .querySelector('.todoFavorite')
              .classList.add('visible');
            arrays.Favorites.push(parsedObj.contents[i]);
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

        arrays["Uncompleted To-Do's"].push(toDoClass);
        arrays["All To-Do's"].push(toDoClass);
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

        if (checkExistingCategory(textContent)) {
          return;
        }

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
        changePage(userCategories[textContent]);
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
        arrays["Completed To-Do's"].push(toDoItem);

        let index = arrays["Uncompleted To-Do's"].indexOf(toDoItem);
        if (index !== -1) {
          arrays["Uncompleted To-Do's"].splice(index, 1);
        }
      } else {
        arrays["Uncompleted To-Do's"].push(toDoItem);

        let index = arrays["Completed To-Do's"].indexOf(toDoItem);
        if (index !== -1) {
          arrays["Completed To-Do's"].splice(index, 1);
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
        const i = arrays.Favorites.indexOf(toDoItem);
        if (i !== -1) arrays.Favorites.splice(i, 1);
      } else {
        toDoItem.toggleFavorite();
        favoriteBtn.classList.add('visible');
        arrays.Favorites.push(toDoItem);
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

  const makeEditable = (item, fn) => {
    item.addEventListener('dblclick', () => {
      item.setAttribute('contenteditable', 'true');
    });

    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.repeat) {
        event.preventDefault();
        item.blur();
      }
    });

    item.addEventListener('blur', () => {
      item.setAttribute('contenteditable', 'false');

      fn();
    });
  };

  const checkExistingCategory = (name) => {
    if (Object.values(userCategories).find((c) => c.getName() === name)) {
      alert(
        'A category / project with this name already exists! Try a different name.'
      );
      return true;
    } else if (
      Object.values(initCategories).find((c) => c.getName() === name)
    ) {
      alert('A category with this name exists! Try a different name.');
      return true;
    }

    return false;
  };

  let currentPage = null;
  const addToDoBtn = createAddToDoBtn();
  const changePage = (page) => {
    currentPage = page;

    Object.values(initCategories).forEach((c) => {
      c.getButton().classList.remove('clicked');
    });
    currentPage.getButton().classList.add('clicked');
    console.log('Current Page Name: ' + currentPage.getName());

    todos.innerHTML = '';
    const title = DomStuff.createPageTitle(currentPage.getName());
    const h1 = title.querySelector('.sectionTitle');
    const deleteBtn = title.querySelector('.sectionDelete');
    if (
      Object.values(userCategories).find(
        (c) => c.getName() === currentPage.getName()
      )
    ) {
      makeEditable(h1, () => {
        const newName = h1.innerText;
        const oldName = currentPage.getName();

        if (checkExistingCategory(newName)) {
          return;
        }

        if (oldName !== newName) {
          currentPage.getButton().textContent =
            currentPage.getIcon() + ' ' + newName;

          currentPage.getButton().setAttribute('buttonname', newName);

          userCategories[newName] = userCategories[oldName];
          delete userCategories[oldName];

          userCategories[newName].setName(newName);
          userCategories[newName].setDisplayName(newName);

          arrays[newName] = arrays[oldName];
          delete arrays[oldName];

          userCategories[newName].setContents(arrays[newName]);

          userCategories[newName]
            .getContents()
            .forEach((c) => c.setParent(newName));

          removeObjectFromLocalStorage(oldName);
          saveObjectToLocalStorage(newName, userCategories[newName]);
        }
      });
    }

    deleteBtn.addEventListener('click', (event) => {
      currentPage.getButton().remove();

      Object.values(arrays).forEach((element) => {
        element.forEach((c) => {
          const i = element.indexOf(c);
          if (i > -1) element.splice(i, 1);
        });
      });

      delete arrays[currentPage.getName()];
      delete userCategories[currentPage.getName()];
      removeObjectFromLocalStorage(currentPage.getName());
      changePage(initCategories.dueTmrwCategory);
    });

    todos.appendChild(title);

    if (
      Object.values(initCategories).find(
        (c) => c.getName() === currentPage.getName()
      )
    ) {
      title.querySelector('.sectionDelete').remove();
    }
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

      console.log(userCategories, btn);
      console.log(initCategories, btn);

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
