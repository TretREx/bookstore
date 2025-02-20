document.addEventListener('DOMContentLoaded', () => {
    loadBooks();
  
    // 动态加载书籍列表
    async function loadBooks() {
      try {
        const response = await fetch('/books');
        if (!response.ok) throw new Error(`HTTP错误 ${response.status}`);
        
        const books = await response.json();
        renderBooks(books);
      } catch (error) {
        showError('加载失败: ' + error.message);
      }
    }
  
    // 渲染书籍表格
    function renderBooks(books) {
        const tbody = document.querySelector('#bookTable tbody');
        tbody.innerHTML = books.map(book => `
          <tr>
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>¥${Number(book.price).toFixed(2)}</td>  <!-- 关键修正 -->
            <td><button onclick="deleteBook(${book.id})">删除</button></td>
          </tr>
        `).join('');
      }
  
    // 显示错误提示
    function showError(message) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error';
      errorDiv.textContent = message;
      document.body.prepend(errorDiv);
      setTimeout(() => errorDiv.remove(), 3000);
    }
  
    // 删除书籍
    window.deleteBook = async (id) => {
        const password = prompt('请输入管理密码:');
        if (!password) return;
      
        try {
          const response = await fetch('/delete-code/book', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, password })
          });
      
          const result = await response.json();
          if (!result.success) throw new Error(result.message);
      
          console.log('删除成功，触发数据刷新');
          loadBooks(); // 确保重新加载数据
        } catch (error) {
          console.error('删除失败:', error);
          alert('删除失败: ' + error.message);
        }
      };
  
    // 添加书籍
// 添加书籍逻辑
window.addBook = async () => {
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const password = document.getElementById('password').value;
  
    if (!title || !author || isNaN(price) || !password) {
      return showError('请填写所有字段');
    }
  
    try {
      const response = await fetch('/add-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author, price, password })
      });
  
      if (!response.ok) throw new Error(await response.text());
      loadBooks();
      clearForm(); // 直接调用无参版本
    } catch (error) {
      showError('添加失败: ' + error.message);
    }
  };
  

  
    // 购买书籍
    window.buyBook = async () => {
      const bookId = parseInt(document.getElementById('bookId').value);
      const contact = document.getElementById('contact').value.trim();
      const pickupTime = document.getElementById('pickupTime').value;
  
      if (!bookId || !contact || !pickupTime) {
        return showError('请填写所有字段');
      }
  
      try {
        const response = await fetch('/buy-book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId, contact, pickupTime })
        });
  
        if (!response.ok) throw new Error(await response.text());
        loadBooks();
        clearForm('buy-book');
      } catch (error) {
        showError('购买失败: ' + error.message);
      }
    };
    
  
  // 清空表单函数
  function clearForm() {
    document.getElementById('title').value = '';
    document.getElementById('author').value = '';
    document.getElementById('price').value = '';
    document.getElementById('password').value = '';
  }
  });