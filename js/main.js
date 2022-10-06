//todo Создать контактную книжку на основе Todo List.
// Функционал должен включать в себя:

// 1. Создание контакта (Имя, Фамилия, номер телефона)
// 2. Удаление контакта
// 3. Список контактов на главном экране
// 4. Использовать json-server.
// 5. Редактирование контакта
// 6. Пагинация(дополнительно)
// 7. Поиск(дополнительно)

let homeBtn = document.querySelector("#home-btn");
let createContactModal = document.querySelector("#createContact-modal");
let createBtn = document.querySelector("#create-btn");
let saveChangesBtn = document.querySelector("#saveChanges-btn");

//! create logic
const CONTACTS_API = " http://localhost:8001/contacts";

//inputs group
let nameInp = document.querySelector("#reg-name");
let surnameInp = document.querySelector("#reg-surname");
let numberInp = document.querySelector("#reg-number");

async function checkUniqueContactName(name) {
  let res = await fetch(CONTACTS_API);
  let contacts = await res.json();
  return contacts.some(item => item.name === name);
}

async function createContact() {
  if (
    !nameInp.value.trim() ||
    !surnameInp.value.trim() ||
    !numberInp.value.trim()
  ) {
    alert("Some inputs are empty!");
    return;
  }
  let uniqueName = await checkUniqueContactName(nameInp.value);

  if (uniqueName) {
    alert("User with this name already exist!");
    return;
  }

  let contactObj = {
    name: nameInp.value,
    surname: surnameInp.value,
    number: numberInp.value,
  };
  fetch(CONTACTS_API, {
    method: "POST",
    body: JSON.stringify(contactObj),
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  });

  alert("Created successfully!");

  nameInp.value = "";
  surnameInp.value = "";
  numberInp.value = "";

  render();
}
createBtn.addEventListener("click", createContact);

//! read
let currentPage = 1;
let search = "";

async function render() {
  let contactsList = document.querySelector("#contacts-list");
  contactsList.innerHTML = "";
  let requestAPI = `${CONTACTS_API}?q=${search}&_page=${currentPage}&_limit=3`;

  let res = await fetch(requestAPI);
  let data = await res.json();

  data.forEach(item => {
    contactsList.innerHTML += `
        <div class="card m-5" style="width: 18rem;">
            <div class="card-body">
                <h5 class="card-title">${item.name}</h5>
                <h5 class="card-text">${item.surname}</h5>
                <h6 class="card-text">${item.number}</h6>
                
                <a href="#" class="btn btn-danger btn-delete" id="${item.id}">DELETE</a>
                <a href="#" class="btn btn-dark btn-edit" data-bs-target="#staticBackdrop" data-bs-toggle="modal" id="${item.id}">EDIT</a>
                  
            </div>
        </div>`;
  });

  addDeleteEvent();
  addEditEvent();
}
render();

//!delete

async function deleteContact(e) {
  let contactId = e.target.id;

  await fetch(`${CONTACTS_API}/${contactId}`, {
    method: "DELETE",
  });

  render();
  alert("Deleted successfuly!");
}

function addDeleteEvent() {
  let deleteContactBtn = document.querySelectorAll(".btn-delete");
  deleteContactBtn.forEach(item => {
    item.addEventListener("click", deleteContact);
  });
}

//!update

function checkCreateAndSaveBtn() {
  if (saveChangesBtn.id) {
    createBtn.setAttribute("style", "display:none ;");
    saveChangesBtn.setAttribute("style", "display:block;");
  } else {
    createBtn.setAttribute("style", "display:block ;");
    saveChangesBtn.setAttribute("style", "display:none;");
  }
}
checkCreateAndSaveBtn();

async function addContactDataToForm(e) {
  let contactId = e.target.id;
  let res = await fetch(`${CONTACTS_API}/${contactId}`);
  let contactObj = await res.json();

  nameInp.value = contactObj.name;
  surnameInp.value = contactObj.surname;
  numberInp.value = contactObj.number;

  saveChangesBtn.setAttribute("id", contactObj.id);

  checkCreateAndSaveBtn();
}

function addEditEvent() {
  let btnEditContact = document.querySelectorAll(".btn-edit");
  btnEditContact.forEach(item => {
    item.addEventListener("click", addContactDataToForm);
  });
}

async function saveChanges(e) {
  let updatedContactObj = {
    id: e.target.id,
    name: nameInp.value,
    surname: surnameInp.value,
    number: numberInp.value,
  };
  await fetch(`${CONTACTS_API}/${e.target.id}`, {
    method: "PUT",
    body: JSON.stringify(updatedContactObj),
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
  nameInp.value = "";
  surnameInp.value = "";
  numberInp.value = "";

  saveChangesBtn.removeAttribute("id");

  checkCreateAndSaveBtn();

  let btnCloseModal = document.querySelector("#btn-close-modal");
  btnCloseModal.click();

  render();
}

saveChangesBtn.addEventListener("click", saveChanges);

// search
let searchInp = document.querySelector("#search-inp");
searchInp.addEventListener("input", () => {
  search = searchInp.value;
  currentPage = 1;
  render();
});

//pagination
let nextPage = document.querySelector("#next-page");
let prevPage = document.querySelector("#prev-page");

async function checkPages() {
  let res = await fetch(CONTACTS_API);
  let data = await res.json();
  let pages = Math.ceil(data.length / 3);

  if (currentPage === 1) {
    prevPage.style.display = "none";
    nextPage.style.display = "block";
  } else if (currentPage === pages) {
    prevPage.style.display = "block";
    nextPage.style.display = "none";
  } else {
    prevPage.style.display = "block";
    nextPage.style.display = "block";
  }
}
checkPages();

nextPage.addEventListener("click", () => {
  currentPage++;
  render();
  checkPages();
});
prevPage.addEventListener("click", () => {
  currentPage--;
  render();
  checkPages();
});

//home

homeBtn.addEventListener("click", () => {
  currentPage = 1; // search
  let searchInp = document.querySelector("#search-inp");
  searchInp.addEventListener("input", () => {
    search = searchInp.value;
    currentPage = 1;
    render();
  });

  //pagination
  let nextPage = document.querySelector("#next-page");
  let prevPage = document.querySelector("#prev-page");

  async function checkPages() {
    let res = await fetch(PRODUCTS_API);
    let data = await res.json();
    let pages = Math.ceil(data.length / 3);

    if (currentPage === 1) {
      prevPage.style.display = "none";
      nextPage.style.display = "block";
    } else if (currentPage === pages) {
      prevPage.style.display = "block";
      nextPage.style.display = "none";
    } else {
      prevPage.style.display = "block";
      nextPage.style.display = "block";
    }
  }
  checkPages();

  nextPage.addEventListener("click", () => {
    currentPage++;
    render();
    checkPages();
  });
  prevPage.addEventListener("click", () => {
    currentPage--;
    render();
    checkPages();
  });

  //home
  let homeBtn = document.querySelector("#home-btn");
  homeBtn.addEventListener("click", () => {
    currentPage = 1;
    category = "";
    search = "";
    render();
    checkPages();
  });

  search = "";
  render();
  checkPages();
});
