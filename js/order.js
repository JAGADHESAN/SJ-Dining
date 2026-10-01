document.addEventListener("DOMContentLoaded", function () {

    console.log("SJ Dining Order page loaded.");

    // -----------------------------
    // GET TABLE NUMBER FROM URL
    // -----------------------------

    const urlParams = new URLSearchParams(window.location.search);
    const tableNumber = urlParams.get("table");

    const tableDisplay = document.getElementById("tableDisplay");

    if (tableNumber) {
        tableDisplay.textContent = "Table " + tableNumber;
    } else {
        tableDisplay.textContent = "Table Not Selected";
    }


    // -----------------------------
    // CART
    // -----------------------------

    let cart = [];


    // -----------------------------
    // ADD BUTTONS
    // -----------------------------

    const addButtons = document.querySelectorAll(".add-btn");

    addButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const name = button.dataset.name;
            const price = Number(button.dataset.price);

            addToCart(name, price);

        });

    });


    // -----------------------------
    // ADD ITEM TO CART
    // -----------------------------

    function addToCart(name, price) {

        const existingItem = cart.find(function (item) {
            return item.name === name;
        });

        if (existingItem) {

            existingItem.quantity++;

        } else {

            cart.push({
                name: name,
                price: price,
                quantity: 1
            });

        }

        updateCart();
    }


    // -----------------------------
    // UPDATE CART
    // -----------------------------

    function updateCart() {

        const cartItems = document.getElementById("cartItems");
        const cartTotal = document.getElementById("cartTotal");

        if (cart.length === 0) {

            cartItems.innerHTML =
                '<div class="empty-cart">No items added yet.</div>';

            cartTotal.textContent = "₹0";

            return;
        }


        cartItems.innerHTML = "";

        let total = 0;


        cart.forEach(function (item, index) {

            const itemTotal = item.price * item.quantity;

            total += itemTotal;


            const cartItem = document.createElement("div");

            cartItem.className = "cart-item";


            cartItem.innerHTML = `
                <div>
                    <strong>${item.name}</strong>
                    <br>
                    ₹${item.price} × ${item.quantity}
                    = ₹${itemTotal}
                </div>

                <div class="cart-controls">

                    <button
                        class="minus-btn"
                        data-index="${index}">
                        −
                    </button>

                    <span>${item.quantity}</span>

                    <button
                        class="plus-btn"
                        data-index="${index}">
                        +
                    </button>

                </div>
            `;


            cartItems.appendChild(cartItem);

        });


        cartTotal.textContent = "₹" + total;


        // -----------------------------
        // MINUS BUTTONS
        // -----------------------------

        document
            .querySelectorAll(".minus-btn")
            .forEach(function (button) {

                button.addEventListener("click", function () {

                    const index =
                        Number(button.dataset.index);

                    cart[index].quantity--;


                    if (cart[index].quantity <= 0) {

                        cart.splice(index, 1);

                    }


                    updateCart();

                });

            });


        // -----------------------------
        // PLUS BUTTONS
        // -----------------------------

        document
            .querySelectorAll(".plus-btn")
            .forEach(function (button) {

                button.addEventListener("click", function () {

                    const index =
                        Number(button.dataset.index);

                    cart[index].quantity++;

                    updateCart();

                });

            });

    }


    // -----------------------------
    // ORDER BUTTON
    // -----------------------------

    const orderButton =
        document.getElementById("orderButton");


    orderButton.addEventListener("click", async function () {

        const customerName =
            document
                .getElementById("customerName")
                .value
                .trim();


        // -----------------------------
        // VALIDATION
        // -----------------------------

        if (!customerName) {

            alert("Please enter your name.");

            return;
        }


        if (!tableNumber) {

            alert(
                "Table number is missing.\n\n" +
                "Please scan the table QR code."
            );

            return;
        }


        if (cart.length === 0) {

            alert("Please add at least one food item.");

            return;
        }


        // -----------------------------
        // CHECK SUPABASE
        // -----------------------------

        if (typeof supabaseClient === "undefined") {

            alert(
                "Supabase connection failed.\n\n" +
                "Please check js/supabase.js"
            );

            return;
        }


        // -----------------------------
        // CALCULATE TOTAL
        // -----------------------------

        let total = 0;

        cart.forEach(function (item) {

            total += item.price * item.quantity;

        });


        // -----------------------------
        // PREVENT DOUBLE CLICK
        // -----------------------------

        orderButton.disabled = true;

        orderButton.textContent = "Saving Order...";


        try {

            console.log("Saving food order to Supabase...");


            // -----------------------------
            // SAVE ORDER TO SUPABASE
            // -----------------------------

            const { error } = await supabaseClient
                .from("food_orders")
                .insert({

                    customer_name: customerName,

                    table_number: tableNumber,

                    items: cart,

                    total_amount: total,

                    status: "pending"

                });


            // -----------------------------
            // HANDLE DATABASE ERROR
            // -----------------------------

            if (error) {

                console.error(
                    "FOOD ORDER SUPABASE ERROR:",
                    error
                );


                alert(
                    "Order could not be saved.\n\n" +
                    error.message
                );


                orderButton.disabled = false;

                orderButton.textContent =
                    "Send Order via WhatsApp";

                return;
            }


            console.log(
                "Food order saved successfully."
            );


            // -----------------------------
            // CREATE WHATSAPP MESSAGE
            // -----------------------------

            let message =
                "SJ DINING FOOD ORDER\n\n";


            message +=
                "Customer: " +
                customerName +
                "\n";


            message +=
                "Table: " +
                tableNumber +
                "\n\n";


            message +=
                "ORDER ITEMS\n";


            cart.forEach(function (item) {

                const itemTotal =
                    item.price * item.quantity;


                message +=
                    item.name +
                    " x " +
                    item.quantity +
                    " = ₹" +
                    itemTotal +
                    "\n";

            });


            message +=
                "\nTOTAL: ₹" +
                total;


            message +=
                "\n\nPlease confirm my order.";


            // -----------------------------
            // WHATSAPP
            // -----------------------------

            const whatsappNumber =
                "919094971556";


            const whatsappURL =
                "https://wa.me/" +
                whatsappNumber +
                "?text=" +
                encodeURIComponent(message);


            console.log(
                "WhatsApp URL:",
                whatsappURL
            );


            alert(
                "Order saved successfully!\n\n" +
                "Opening WhatsApp..."
            );


            window.location.href =
                whatsappURL;


        } catch (error) {

            console.error(
                "UNEXPECTED FOOD ORDER ERROR:",
                error
            );


            alert(
                "Something went wrong.\n\n" +
                error.message
            );


            orderButton.disabled = false;

            orderButton.textContent =
                "Send Order via WhatsApp";

        }

    });

});