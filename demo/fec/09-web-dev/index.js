var $ = function(sel) {
  return document.querySelector(sel);
};
var $All = function(sel) {
  return document.querySelectorAll(sel);
};
var guid = 0;
var CL_COMPLETED = 'completed';
var CL_SELECTED = 'selected';
var CL_EDITING = 'editing';

function update() {
  var items = $All('.todo-list li');
  var filter = $('.filters li a.selected').innerHTML;
  var leftNum = 0;
  var item, i, display;

  for (i = 0; i < items.length; ++i) {
    item = items[i];
    if (!item.classList.contains(CL_COMPLETED)) leftNum++;

    // filters
    display = 'none';
    if (filter == 'All'
      || (filter == 'Active' && !item.classList.contains(CL_COMPLETED))
      || (filter == 'Completed' && item.classList.contains(CL_COMPLETED))) {

      display = '';
    }
    item.style.display = display;
  }

  var completedNum = items.length - leftNum;
  var count = $('.todo-count');
  count.innerHTML = (leftNum || 'No') + (leftNum > 1 ? ' items' : ' item') + ' left';

  var clearCompleted = $('.clear-completed');
  clearCompleted.style.visibility = completedNum > 0 ? 'visible' : 'hidden';

  var toggleAll = $('.toggle-all');
  toggleAll.style.visibility = items.length > 0 ? 'visible' : 'hidden';
  toggleAll.checked = items.length == completedNum;
}

function addTodo(msg) {
  var todoList = $('.todo-list');

  var item = document.createElement('li');
  var id = 'item' + guid++;
  item.setAttribute('id', id);
  item.innerHTML = [
    '<div class="view">',
    '  <input class="toggle" type="checkbox">',
    '  <label class="todo-label">' + msg + '</label>',
    '  <button class="destroy"></button>',
    '</div>'
  ].join('');

  var label = item.querySelector('.todo-label');
  label.addEventListener('dblclick', function() {
    item.classList.add(CL_EDITING);

    var edit = document.createElement('input');
    var finished = false;
    edit.setAttribute('type', 'text');
    edit.setAttribute('class', 'edit');
    edit.setAttribute('value', label.innerHTML);
    function finish() {
      if (finished) return;
      finished = true;
      item.removeChild(edit);
      item.classList.remove(CL_EDITING);
    }

    edit.addEventListener('blur', function() {
      finish();
    }, false);

    edit.addEventListener('keyup', function(ev) {
      if (ev.keyCode == 27) { // Esc
        finish();
      }
      else if (ev.keyCode == 13) {
        label.innerHTML = this.value;
        finish();
      }
    }, false);

    item.appendChild(edit);
    edit.focus();
  }, false);

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
  for (var i = items.length - 1; i >= 0; --i) {
    var item = items[i];
    if (item.classList.contains(CL_COMPLETED)) {
      todoList.removeChild(item);
    }
  }
  update();
}

function toggleAllTodoList() {
  var items = $All('.todo-list li');
  var toggleAll = $('.toggle-all');
  var checked = toggleAll.checked;
  for (var i = 0; i < items.length; ++i) {
    var item = items[i];
    var toggle = item.querySelector('.toggle');
    if (toggle.checked != checked) {
      toggle.checked = checked;
      if (checked) item.classList.add(CL_COMPLETED);
      else item.classList.remove(CL_COMPLETED);
    }
  }
  update();
}

window.onload = function init() {
  var newTodo = $('.new-todo');
  newTodo.addEventListener('keyup', function(ev) {
    // Enter
    if (ev.keyCode != 13) return;

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