window.onload = function () {
   document.addEventListener("click", documentActions);


   //Actions (делегирование событий click)

   function documentActions(e) {
      //создаем константу и присваиваем нажатый обьект
      const targetElement = e.target;
      if (window.innerWidth > 768 && isMobile.any()) {
         //прослушиваем определенный класс menu__arrow
         if (targetElement.classList.contains('menu__arrow')) {
            //стучимся до ближайшего родителя и добавляем ему класс hover
            targetElement.closest('.menu__item').classList.toggle('_hover');
         }

         //<Убираем sub__menu по клику в любом месте страницы (для тачскринов)>
         if (!targetElement.closest('.menu__item') && document.querySelectorAll('.menu__item._hover').length > 0) {
            //отнимаем класс hover
            _removeClasses(document.querySelectorAll('.menu__item._hover'), "_hover");
         } //</Убираем sub__menu по клику в любом месте страницы (для тачскринов)>
      }
      //если у нашего обьекта есть класс 'search-form__icon'
      if (targetElement.classList.contains('search-form__icon')) {
         //тогда мы находим обьект '.search-form' обращаемся к списку классов и убираем или добавляем '_active'
         document.querySelector('.search-form').classList.toggle('_active');
         //Убираем поле формы щелкнув по любому месту
      } else if (!targetElement.closest('.search-form') && document.querySelector('.search-form._active')) {
         document.querySelector('.search-form').classList.remove('_active');
      }
      //работа с json-файлом. Отлавливаем клик по кнопке с классом .products__more
      if (targetElement.classList.contains('products__more')) {
         //далее отправляем нашу кнопочку в функцию getProducts
         getProducts(targetElement);
         //отменяем действие по умолчанию (чтобы страница не перезагружалась т.к. кнопка - это ссылка)
         e.preventDefault();
      }
      //отлавливаем клик по кнопке добавления в корзину с классом .actions-product__button
      if (targetElement.classList.contains('actions-product__button')) {
         //в константу получаем содержимое data-атрибута. Для этого ищем среди родителей нажатой кнопки--
         //--обьект с классом .item-product
         const productId = targetElement.closest('.item-product').dataset.pid
         //после чего саму кнопку и полученный id отправляем в функцию
         addToCart(targetElement, productId);
         e.preventDefault();
      }

      if (targetElement.classList.contains('cart-header__icon') || targetElement.closest('.cart-header__icon')) {
         if (document.querySelector('.cart-list').children.length > 0) {
            document.querySelector('.cart-header').classList.toggle('_active');
         }
         e.preventDefault();
      } else if (!targetElement.closest('.cart-header') && !targetElement.classList.contains('actions-product__button')) {
         document.querySelector('.cart-header').classList.remove('_active');
      }

      //Удаление обьектов из корзины
      if (targetElement.classList.contains('cart-list__delete')) {
         const productId = targetElement.closest('.cart-list__item').dataset.cartPid;
         updateCart(targetElement, productId, false);
         e.preventDefault();
      }

   }
   //header - подключаем класс _scroll
   const headerElement = document.querySelector('.header');

   const callback = function (entries, observer) {
      if (entries[0].isIntersecting) {
         headerElement.classList.remove('_scroll');
      } else {
         headerElement.classList.add('_scroll');
      }
   };

   const headerObserver = new IntersectionObserver(callback);
   headerObserver.observe(headerElement);


   //load More Products

   async function getProducts(button) {
      //проверяем на класс ._hold - этот класс нужен чтобы избежать--
      //--повторного нажатия на кнопку до того как подгрузится файл
      if (!button.classList.contains('_hold')) {
         //если класса _hold нет, то добавляем его
         button.classList.add('_hold');
         const file = "json/products.json";
         //получаем файл в переменную
         let response = await fetch(file, {
            method: "GET"
         });
         //проверяем что файл найден, получен и т.д.
         if (response.ok) {
            //подгружаем в переменную инфу в формате .json
            let result = await response.json();
            //результат отправляем в функцию loadProducts
            loadProducts(result);
            //после этого убираем класс ._hold у кнопки
            button.classList.remove('_hold');
            //после удаляем всю кнопку, если этого не сделать то при ее--
            //--повторном нажатии будут подгружаться все те же файлы
            button.remove();
         } else {
            alert("Ошибка");
         }
      }
   }

   function loadProducts(data) {
      const productsItems = document.querySelector('.products__items');

      data.products.forEach(item => {
         const productId = item.id;
         const productUrl = item.url;
         const productImage = item.image;
         const productTitle = item.title;
         const productText = item.text;
         const productPrice = item.price;
         const productOldPrice = item.priceOld;
         const productShareUrl = item.shareUrl;
         const productLikeUrl = item.likeUrl;
         const productLabels = item.labels;

         let productTemplateStart = `<article data-pid="${productId}" class="products__item item-product">`;
         let productTemplateEnd = `</article>`;

         let productTemplateLabels = '';
         if (productLabels) {
            let productTemplateLabelsStart = `<div class="item-product__labels">`;
            let productTemplateLabelsEnd = `</div>`;
            let productTemplateLabelsContent = '';

            productLabels.forEach(labelItem => {
               productTemplateLabelsContent += `<div class="item-product__label item-product__label_${labelItem.type}">${labelItem.value}</div>`;
            });

            productTemplateLabels += productTemplateLabelsStart;
            productTemplateLabels += productTemplateLabelsContent;
            productTemplateLabels += productTemplateLabelsEnd;
         }

         let productTemplateImage = `
      <a href="${productUrl}" class="item-product__image _ibg">
         <img src="img/products/${productImage}" alt="${productTitle}">
      </a>
   `;

         let productTemplateBodyStart = `<div class="item-product__body">`;
         let productTemplateBodyEnd = `</div>`;

         let productTemplateContent = `
      <div class="item-product__content">
         <h3 class="item-product__title">${productTitle}</h3>
         <div class="item-product__text">${productText}</div>
      </div>
   `;

         let productTemplatePrices = '';
         let productTemplatePricesStart = `<div class="item-product__prices">`;
         let productTemplatePricesCurrent = `<div class="item-product__price">Rp ${productPrice}</div>`;
         let productTemplatePricesOld = `<div class="item-product__price item-product__price_old">Rp ${productOldPrice}</div>`;
         let productTemplatePricesEnd = `</div>`;

         productTemplatePrices = productTemplatePricesStart;
         productTemplatePrices += productTemplatePricesCurrent;
         if (productOldPrice) {
            productTemplatePrices += productTemplatePricesOld;
         }
         productTemplatePrices += productTemplatePricesEnd;

         let productTemplateActions = `
      <div class="item-product__actions actions-product">
         <div class="actions-product__body">
            <a href="" class="actions-product__button button button_white">Add to cart</a>
            <a href="${productShareUrl}" class="actions-product__link _icon-share">Share</a>
            <a href="${productLikeUrl}" class="actions-product__link _icon-favorite">Like</a>
         </div>
      </div>
   `;

         let productTemplateBody = '';
         productTemplateBody += productTemplateBodyStart;
         productTemplateBody += productTemplateContent;
         productTemplateBody += productTemplatePrices;
         productTemplateBody += productTemplateActions;
         productTemplateBody += productTemplateBodyEnd;

         let productTemplate = '';
         productTemplate += productTemplateStart;
         productTemplate += productTemplateLabels;
         productTemplate += productTemplateImage;
         productTemplate += productTemplateBody;
         productTemplate += productTemplateEnd;

         productsItems.insertAdjacentHTML('beforeend', productTemplate);
      });
   }

   //addToCart
   function addToCart(productButton, productId) {
      //опять предохраняемся от множественного нажатия на кнопку
      if (!productButton.classList.contains('_hold')) {
         productButton.classList.add('_hold');
         //добавим так же кнопке класс ._fly
         productButton.classList.add('_fly');

         const cart = document.querySelector('.cart-header__icon');
         const product = document.querySelector(`[data-pid="${productId}"]`);
         const productImage = product.querySelector('.item-product__image');
         //эффект летящей картинки. Кланируем картинку
         const productImageFly = productImage.cloneNode(true);
         //получаем размеры и координаты картинки
         const productImageFlyWidth = productImage.offsetWidth;
         const productImageFlyHeight = productImage.offsetHeight;
         const productImageFlyTop = productImage.getBoundingClientRect().top;
         const productImageFlyLeft = productImage.getBoundingClientRect().left;
         //применение полученных размеров для нашего клона
         productImageFly.setAttribute('class', '_flyImage _ibg');
         productImageFly.style.cssText =
            `
         left: ${productImageFlyLeft}px;
         top: ${productImageFlyTop}px;
         width: ${productImageFlyWidth}px;
         height: ${productImageFlyHeight}px;
      `;

         document.body.append(productImageFly);
         //получаем координаты корзины
         const cartFlyLeft = cart.getBoundingClientRect().left;
			const cartFlyTop = cart.getBoundingClientRect().top;
         //присваиваем клону новое значение left и top
         productImageFly.style.cssText =
				`
			left: ${cartFlyLeft}px;
			top: ${cartFlyTop}px;
         width: 0px;
         height: 0px;
         opacity:0;
      `;

         productImageFly.addEventListener('transitionend', function () {
				if (productButton.classList.contains('_fly')) {
					productImageFly.remove();
					updateCart(productButton, productId);
					productButton.classList.remove('_fly');
				}
			});
		}
	}


   function updateCart(productButton, productId, productAdd = true) {
      const cart = document.querySelector('.cart-header');
      const cartIcon = cart.querySelector('.cart-header__icon');
      const cartQuantity = cartIcon.querySelector('span')
      const cartProduct = document.querySelector(`[data-cart-pid="${productId}"]`);
      const cartList = document.querySelector('.cart-list');

      //Добавляем
      if (productAdd) {
         if (cartQuantity) {
            cartQuantity.innerHTML = ++cartQuantity.innerHTML;
         } else {
            cartIcon.insertAdjacentHTML('beforeend', `<span>1</span>`);
         }
         if (!cartProduct) {
            const product = document.querySelector(`[data-pid="${productId}"]`);
            const cartProductImage = product.querySelector('.item-product__image').innerHTML;
            const cartProductTitle = product.querySelector('.item-product__title').innerHTML;
            const cartProductContent = `
            <a href="" class="cart-list__image _ibg">${cartProductImage}</a>
            <div class="cart-list__body">
               <a href="" class="cart-list__title">${cartProductTitle}</a>
               <div class="cart-list__quantity">Quantity: <span>1</span></div>
               <a href="" class="cart-list__delete">Delete</a>
            </div>`;
            cartList.insertAdjacentHTML('beforeend', `<li data-cart-pid="${productId}" class="cart-list__item">${cartProductContent}</li>`);
         } else {
            const cartProductQuantity = cartProduct.querySelector('.cart-list__quantity span');
            cartProductQuantity.innerHTML = ++cartProductQuantity.innerHTML
         }

         //После всех действий
         productButton.classList.remove('_hold');
      } else {
         const cartProductQuantity = cartProduct.querySelector('.cart-list__quantity span');
         cartProductQuantity.innerHTML = --cartProductQuantity.innerHTML;
         if (!parseInt(cartProductQuantity.innerHTML)) {
            cartProduct.remove();
         }

         const cartQuantityValue = --cartQuantity.innerHTML;

         if (cartQuantityValue) {
            cartQuantity.innerHTML = cartQuantityValue;
         } else {
            cartQuantity.remove();
            cart.classList.remove('_active');
         }
      }
   }
}
