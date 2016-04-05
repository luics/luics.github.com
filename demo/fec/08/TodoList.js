var $ = function(sel) {
  return document.querySelector(sel);
};
var $All = function(sel) {
  return document.querySelectorAll(sel);
};
var guid = 0;
var CL_COMPLETED = 'completed';
var CL_SELECTED = 'selected';

function update() {
  var todoList = $('.todo-list');
  var items = todoList.querySelectorAll('li');
  var status = $('.filters li a.selected').innerHTML;
  var leftNum = 0;
  var item, i, display;
  for (i = 0; i < items.length; ++i) {
    item = items[i];
    if (!item.classList.contains(CL_COMPLETED)) leftNum++;
    
    // filters
    display = 'none';
    if (status == 'All'
      || (status == 'Active' && !item.classList.contains(CL_COMPLETED))
      || (status == 'Completed' && item.classList.contains(CL_COMPLETED))) {

      display = '';
    }
    item.style.display = display;
  }

  var doingNum = $('#doingNum');
  doingNum.innerHTML = leftNum;
  var clearCompleted = $('.clear-completed');
  clearCompleted.style.display = (items.length - leftNum) > 0 ? '' : 'none';
}

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

function clearCompletedTodoList() {
  var todoList = $('.todo-list');
  var items = todoList.querySelectorAll('li');
  for (var i = 0; i < items.length; ++i) {
    var item = items[i];
    if (item.classList.contains(CL_COMPLETED)) {
      var toggle = item.querySelector('.toggle');
      //toggle.click(); perf
      toggle.checked = false;
      item.classList.remove(CL_COMPLETED);
    }
  }
  update();
}

function toggleAllTodoList() {
  var todoList = $('.todo-list');
  var items = todoList.querySelectorAll('li');
  for (var i = 0; i < items.length; ++i) {
    var item = items[i];
    if (item.classList.contains(CL_COMPLETED)) {
      var toggle = item.querySelector('.toggle');
      //toggle.click(); perf
      toggle.checked = false;
      item.classList.remove(CL_COMPLETED);
    }
  }
  update();
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
    if (msg == '') {
      console.warn('msg is empty');
      return;
    }

    addTodo(msg);
    newTodo.value = '';
  }, false);

  var clearCompleted = $('.clear-completed');
  clearCompleted.addEventListener('click', function() {
    clearCompletedTodoList();
  }, false);

  var toggleAll = $('.toggle-all');
  toggleAll.addEventListener('change', function() {
    toggleAllTodoList();
  }, false);

  var filters = $All('.filters li a');
  for (var i = 0; i < filters.length; ++i) {
    (function(filter) {
      filter.addEventListener('click', function() {
        for (var j = 0; j < filters.length; ++j) {
          filters[j].classList.remove(CL_SELECTED);
        }
        filter.classList.add(CL_SELECTED);
        update();
      }, false);
    })(filters[i])
  }

  update();
};