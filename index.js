const myLibrary = [];

class Book {
    constructor(payload) {
        this.#verifyPayload(payload);
        const { title, author, pages, isRead } = payload;

        this.id = crypto.randomUUID();
        this.title = title;
        this.author = author;
        this.pages = pages;
        this.read = isRead;
    }

    #verifyPayload = (payload) => {
        const { title, author, pages, isRead } = payload;
        const errorMsg = 'Invalid data type';

        if(typeof title !== 'string' || typeof author !== 'string') throw new Error(`${errorMsg}: title or author is not string`);
        if(typeof pages !== 'number') throw new Error(`${errorMsg}: pages is not number`);
        if(typeof isRead !== 'boolean') throw new Error(`${errorMsg}: isRead is not boolean`);
    }
}

const addBookToLibrary = (payload) => {
    const book = new Book(payload);
    myLibrary.push(book);
    document.dispatchEvent(new Event(RENDER_EVENT));
}

const deleteBook = (id) => {
    const index = myLibrary.findIndex(b => b.id === id);

    if (index !== -1) {
        myLibrary.splice(index, 1);
    } else {
        return;
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

const moveBook = (id, status) => {
    const book = myLibrary.find(b => b.id === id);
    book.read = status;

    document.dispatchEvent(new Event(RENDER_EVENT));
}

const searchBookTitle = (query) => myLibrary.filter((book) => book.title.toLowerCase().includes(query));

const makeBook = (obj) => {
    const target = obj.read
        ? document.querySelector('#completedBookList')
        : document.querySelector('#uncompletedBookList')
    ;

    const bookEl = `
        <div class="book" data-id="${obj.id}" data-title="${obj.title}" data-pages="${obj.pages}"
            data-author="${obj.author}" data-read="${obj.read}" title="${obj.title} - ${obj.author}">
            <span>${obj.title}</span>
            <span>By</span>
            <span>${obj.author}</span>
        </div>
    `;

    return { bookEl, target };
}

// render 
const RENDER_EVENT = 'render_library';
const completeBookList = document.querySelector('#completedBookList');
const uncompleteBookList = document.querySelector('#uncompletedBookList');

document.addEventListener(RENDER_EVENT, () => {
    completeBookList.innerHTML = '';
    uncompleteBookList.innerHTML = '';

    for (const book of myLibrary) {
        const { bookEl, target } = makeBook(book);
        target.innerHTML += bookEl;
    }
});

const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const isRead = document.querySelector('#isRead');

    const formData = new FormData(form);

    const payload = Object.fromEntries(formData);
    payload.isRead = isRead.checked;
    payload.pages = Number(payload.pages);

    addBookToLibrary(payload);
    form.reset();    
});

const modal = document.querySelector('.book-views');

[completeBookList, uncompleteBookList].forEach((el) => {
    el.addEventListener('click', (e) => {
        if (e.target.parentElement.className === 'book') {
            const target = e.target.parentElement;

            modal.setAttribute('data-id', target.dataset.id);
            modal.querySelector('h2').textContent = target.dataset.title;
            modal.querySelector('#author').textContent = `Author: ${target.dataset.author}`;
            modal.querySelector('#pages').textContent = `Pages: ${target.dataset.pages}`;
            modal.querySelector('#readStatus').textContent = `Status: ${target.dataset.read === 'false' ? 'on Read' : 'Readed'}`;

            const btn = modal.querySelector('.tools iconify-icon:first-child');
            if (target.dataset.read === 'false') {
                btn.setAttribute('icon', 'mdi:folder-move-outline');
                btn.setAttribute('title', 'Move to Completed');
            } else if (target.dataset.read === 'true') {
                btn.setAttribute('icon', 'mdi:reload');
                btn.setAttribute('title', 'Undo');
            } 

            modal.showModal();
        }
    });
});

modal.addEventListener('click', (e) => {
    switch (e.target.title) {
        case 'Close':
            modal.close();
            break;
        case 'Delete':
            deleteBook(e.currentTarget.dataset.id);
            modal.close();
            break;
        case 'Move to Completed':
            moveBook(e.currentTarget.dataset.id, true);
            modal.close();
            break;
        case 'Undo':
            moveBook(e.currentTarget.dataset.id, false);
            modal.close();
            break;
            
        default:
            return;
    }
});

const searchSection = document.querySelector('#search > form');
const query = document.querySelector('#searchBook');

searchSection.addEventListener('submit', (e) => {
    e.preventDefault();

    completeBookList.innerHTML = '';
    uncompleteBookList.innerHTML = '';

    const filtered = searchBookTitle(query.value.toLowerCase());
   
    if (!filtered.length) {
        return;
    } else {
        for (const book of filtered) {
            const { bookEl, target } = makeBook(book);
            target.innerHTML += bookEl;
        }
    }

    query.addEventListener('input', (e) => {
        if (!e.target.value.length) document.dispatchEvent(new Event(RENDER_EVENT));
    })
});