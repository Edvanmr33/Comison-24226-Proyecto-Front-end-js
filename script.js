document.addEventListener("DOMContentLoaded", () => {
  const apiURL = "productos.json";
  const productContainer = document.querySelector(".Products");
  const cartTableBody = document.querySelector("#lista-carrito tbody");
  const emptyCartBtn = document.querySelector("#vaciar-carrito");
  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  const cartCount = document.createElement("span");
  const cartSubmenu = document.querySelector("#carrito");

  cartCount.id = "cart-count";
  document.querySelector("#img-carrito").parentElement.appendChild(cartCount);

  function updateCartCount() {
      cartCount.textContent = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  function saveCartToStorage() {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }

  function renderCart() {
      cartTableBody.innerHTML = "";
      let total = 0;

      cartItems.forEach((item, index) => {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td><img src="${item.image}" alt="${item.title}" width="50"></td>
              <td>${item.title}</td>
              <td>$${item.price.toFixed(2)}</td>
              <td>
                  <input type="number" value="${item.quantity}" min="1" data-index="${index}">
                  <button class="remove-item" data-index="${index}">X</button>
              </td>
          `;
          cartTableBody.appendChild(row);
          total += item.price * item.quantity;
      });

      const totalRow = document.createElement("tr");
      totalRow.innerHTML = `
          <td colspan="3"><strong>Total:</strong></td>
          <td>$${total.toFixed(2)}</td>
      `;
      cartTableBody.appendChild(totalRow);
  }

  function renderCartSubmenu() {
      cartSubmenu.innerHTML = `
          <table>
              <thead>
                  <tr>
                      <th>Imagen</th>
                      <th>Nombre</th>
                      <th>Cantidad</th>
                      <th>Subtotal</th>
                  </tr>
              </thead>
              <tbody>
                  ${cartItems
                      .map(
                          (item) => `
                              <tr>
                                  <td><img src="${item.image}" alt="${item.title}" width="40"></td>
                                  <td>${item.title}</td>
                                  <td>
                                      <input type="number" value="${item.quantity}" min="1" data-id="${item.id}" class="update-quantity">
                                  </td>
                                  <td>$${(item.price * item.quantity).toFixed(2)}</td>
                              </tr>
                          `
                      )
                      .join("")}
              </tbody>
          </table>
          <div>
              <strong>Total:</strong> $${cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
          </div>
      `;
  }

  function addToCart(product) {
      const existingItem = cartItems.find((item) => item.id === product.id);
      if (existingItem) {
          existingItem.quantity++;
      } else {
          cartItems.push({ ...product, quantity: 1 });
      }
      saveCartToStorage();
      updateCartCount();
      renderCart();
      renderCartSubmenu();
  }

  async function fetchProducts() {
      try {
          const response = await fetch(apiURL);
          const products = await response.json();
          productContainer.innerHTML = "";

          products.forEach((product) => {
              const card = document.createElement("div");
              card.classList.add("info");
              card.innerHTML = `
                  <h1 class="info-1">${product.title}</h1>
                  <img src="${product.image}" width="45%" height="250px" alt="${product.title}">
                  <p class="info-2">$${product.price.toFixed(2)}</p>
                  <button class="btn add-to-cart" data-id="${product.id}">Agregar al carrito</button>
              `;
              productContainer.appendChild(card);
          });

          document.querySelectorAll(".add-to-cart").forEach((button) => {
              button.addEventListener("click", (e) => {
                  const id = parseInt(e.target.dataset.id);
                  const product = products.find((p) => p.id === id);
                  addToCart(product);
              });
          });
      } catch (error) {
          console.error("Error al obtener los productos:", error);
      }
  }

  cartTableBody.addEventListener("change", (e) => {
      if (e.target.type === "number") {
          const index = parseInt(e.target.dataset.index);
          const quantity = parseInt(e.target.value);
          cartItems[index].quantity = quantity;
          saveCartToStorage();
          renderCart();
          renderCartSubmenu();
      }
  });

  cartSubmenu.addEventListener("change", (e) => {
      if (e.target.classList.contains("update-quantity")) {
          const id = parseInt(e.target.dataset.id);
          const quantity = parseInt(e.target.value);
          const product = cartItems.find((item) => item.id === id);
          if (product) {
              product.quantity = quantity;
              saveCartToStorage();
              renderCart();
              renderCartSubmenu();
          }
      }
  });

  cartTableBody.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-item")) {
          const index = parseInt(e.target.dataset.index);
          cartItems.splice(index, 1);
          saveCartToStorage();
          updateCartCount();
          renderCart();
          renderCartSubmenu();
      }
  });

  emptyCartBtn.addEventListener("click", () => {
      cartItems.length = 0;
      saveCartToStorage();
      updateCartCount();
      renderCart();
      renderCartSubmenu();
  });

  fetchProducts();
  updateCartCount();
  renderCart();
  renderCartSubmenu();
});
