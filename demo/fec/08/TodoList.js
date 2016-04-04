var guid = 0;
var CL_COMPLETED = 'completed';
var CL_SELECTED = 'selected';
var $ = function(sel) {
  return document.querySelector(sel);
};
var $All = function(sel) {
  return document.querySelectorAll(sel);
};

function addTodo(msg) {
  var todoList = $('.todo-list');

  var item = document.createElement('li');
  var id = 'item' + guid++;
  item.setAttribute('id', id);
  item.innerHTML = [
    '<div class="view">',
    '  <input class="toggle" type="checkbox">',
    '  <label>' + msg + '</label>',
    '  <button class="destroy"></button>',
    '</div>'
  ].join('');

  item.querySelector('.toggle').addEventListener('change', function() {
    updateTodo(id, this.checked);
  }, false);

  item.querySelector('.destroy').addEventListener('click', function() {
    removeTodo(id);
  }, false);

  todoList.insertBefore(item, todoList.firstChild);
  update();
}

function updateTodo(itemId, done) {
  var item = $('#' + itemId);
  if (done) item.classList.add(CL_COMPLETED);
  else item.classList.remove(CL_COMPLETED);
  update();
}

function removeTodo(itemId) {
  var todoList = $('.todo-list');
  var item = $('#' + itemId);
  todoList.removeChild(item);
  update();
}

function update() {
  var todoList = $('.todo-list');
  var items = todoList.querySelectorAll('li');
  var leftNum = 0;
  for (var i = 0; i < items.length; ++i) {
    var item = items[i];
    if (!item.classList.contains(CL_COMPLETED)) leftNum++;
  }

  var doingNum = $('#doingNum');
  doingNum.innerHTML = leftNum;
}

function filterTodoList(status) {
  var items = $All('.todo-list li');
  for (var item, display, i = 0; i < items.length; ++i) {
    item = items[i];
    display = 'none';
    if (status == 'All'
      || (status == 'Active' && !item.classList.contains(CL_COMPLETED))
      || (status == 'Completed' && item.classList.contains(CL_COMPLETED))) {
      display = '';
    }
    item.style.display = display;
  }
}

// init
window.onload = function init() {
  var newTodo = $('.new-todo');
  newTodo.addEventListener('keyup', function(ev) {
    // enter key
    if (ev.keyCode != 13) {
      return;
    }

    var msg = newTodo.value;
    // check 
    if (msg == '') {
      console.warn('msg is empty');
      return;
    }

    addTodo(msg);
    newTodo.value = '';
  }, false);

  var filters = $All('.filters li a');
  for (var i = 0; i < filters.length; ++i) {
    (function(filter) {
      filter.addEventListener('click', function() {
        for (var j = 0; j < filters.length; ++j) {
          filters[j].classList.remove(CL_SELECTED);
        }
        filter.classList.add(CL_SELECTED);
        filterTodoList(this.innerHTML);
      }, false);
    })(filters[i])
  }
};