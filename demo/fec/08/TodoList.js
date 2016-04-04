var guid = 0;

function addTodo(msg) {
  var todoList = document.querySelector('#todoList');

  var item = document.createElement('li');
  var id = 'item' + guid++;
  item.setAttribute('id', id);
  item.setAttribute('data-done', '0');
  item.innerHTML = [
    '<div class="view">',
    '  <input class="toggle" type="checkbox">',
    '  <label>' + msg + '</label>',
    '  <button class="destroy" onclick="removeTodo(\'' + id + '\')"></button>',
    '</div>'
  ].join('');

  todoList.insertBefore(item, todoList.firstChild);
  updateStatus();
}

function removeTodo(itemId) {
  var todoList = document.querySelector('#todoList');
  var item = document.getElementById(itemId);
  todoList.removeChild(item);
  updateStatus();
}

function updateStatus() {
  var todoList = document.querySelector('#todoList');
  var items = todoList.querySelectorAll('li');
  var leftNum = 0;
  for (var i = 0; i < items.length; ++i) {
    var item = items[i];
    if (item.getAttribute('data-done') == '0') leftNum++;
  }

  var doingNum = document.getElementById('doingNum');
  doingNum.innerHTML = leftNum;
}

window.onload = function() {
  var newTodo = document.querySelector('#newTodo');
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
};