document.addEventListener("DOMContentLoaded", function () {

    console.log("SJ Dining Order page loaded.");

    // ==========================================
    // GET TABLE NUMBER
    // ==========================================

    const urlParams = new URLSearchParams(window.location.search);

    const tableNumber = urlParams.get("table");

    const tableDisplay = document.getElementById("tableDisplay");

    if (tableNumber) {
        tableDisplay.textContent = "Table " + tableNumber;
    } else {
        tableDisplay.textContent = "Table Not Selected";
    }


    // ==========================================
    // CART
    // ==========================================

    let cart = [];


    // ==========================================
    // ADD BUTTONS
    // ==========================================

    const addButtons = document.querySelectorAll(".add-btn");

    addButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const name = button.dataset.name;

            const price = Number(button.dataset.price);

            addToCart(name, price);

        });

    });


    // ==========================================
    // ADD TO CART
    // ==========================================

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


    // ==========================================
    // UPDATE CART
    // ==========================================

    function updateCart() {

        const cartItems =
            document.getElementById("cartItems");

        const cartTotal =
            document.getElementById("cartTotal");


        if (cart.length === 0) {

            cartItems.innerHTML =
                '<div class="empty-cart">No items added yet.</div>';

            cartTotal.textContent = "₹0";

            return;
        }


        cartItems.innerHTML = "";

        let total = 0;


        cart.forEach(function (item, index) {

            const itemTotal =
                item.price * item.quantity;

            total += itemTotal;


            const cartItem =
                document.createElement("div");

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

                    <span>
                        ${item.quantity}
                    </span>

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


        // MINUS BUTTON

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


        // PLUS BUTTON

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


    // ==========================================
    // ORDER BUTTON
    // ==========================================

    const orderButton =
        document.getElementById("orderButton");


    orderButton.addEventListener("click", async function () {


        // ==========================================
        // CUSTOMER NAME
        // ==========================================

        const customerName =
            document
                .getElementById("customerName")
                .value
                .trim();


        // ==========================================
        // CUSTOMER PHONE
        // ==========================================

        const customerPhone =
            document
                .getElementById("customerPhone")
                .value
                .trim();


        // ==========================================
        // VALIDATE NAME
        // ==========================================

        if (!customerName) {

            alert("Please enter your name.");

            return;
        }


        // ==========================================
        // VALIDATE PHONE
        // ==========================================

        if (!customerPhone) {

            alert("Please enter your WhatsApp number.");

            return;
        }


        // ==========================================
        // CLEAN PHONE NUMBER
        // ==========================================

        let cleanPhone =
            customerPhone.replace(/\D/g, "");


        // Indian 10-digit number

        if (cleanPhone.length === 10) {

            cleanPhone = "91" + cleanPhone;

        }


        // Validate Indian WhatsApp number

        if (
            cleanPhone.length !== 12 ||
            !cleanPhone.startsWith("91")
        ) {

            alert(
                "Please enter a valid Indian WhatsApp number."
            );

            return;
        }


        // ==========================================
        // TABLE NUMBER
        // ==========================================

        if (!tableNumber) {

            alert(
                "Table number is missing.\n\n" +
                "Please scan the table QR code."
            );

            return;
        }


        // ==========================================
        // CART
        // ==========================================

        if (cart.length === 0) {

            alert(
                "Please add at least one food item."
            );

            return;
        }


        // ==========================================
        // SUPABASE CHECK
        // ==========================================

        if (
            typeof supabaseClient === "undefined"
        ) {

            alert(
                "Supabase connection failed.\n\n" +
                "Please check js/supabase.js"
            );

            return;
        }


        // ==========================================
        // CALCULATE TOTAL
        // ==========================================

        let total = 0;

        cart.forEach(function (item) {

            total +=
                item.price * item.quantity;

        });


        // ==========================================
        // DISABLE BUTTON
        // ==========================================

        orderButton.disabled = true;

        orderButton.textContent =
            "Saving Order...";


        try {

            console.log(
                "Saving food order to Supabase..."
            );


            // ==========================================
            // INSERT FOOD ORDER
            // ==========================================

            const { error } =
                await supabaseClient
                    .from("food_orders")
                    .insert({

                        customer_name:
                            customerName,

                        customer_phone:
                            cleanPhone,

                        table_number:
                            tableNumber,

                        items:
                            cart,

                        total_amount:
                            total,

                        status:
                            "pending"

                    });


            // ==========================================
            // SUPABASE ERROR
            // ==========================================

            if (error) {

                console.error(
                    "FOOD ORDER SUPABASE ERROR:",
                    error
                );

                console.error(
                    "Error Code:",
                    error.code
                );

                console.error(
                    "Error Details:",
                    error.details
                );

                console.error(
                    "Error Hint:",
                    error.hint
                );


                alert(
                    "Order could not be saved.\n\n" +
                    "Message: " +
                    error.message +
                    "\n\nCode: " +
                    (error.code || "N/A") +
                    "\n\nHint: " +
                    (error.hint || "No hint available")
                );


                orderButton.disabled = false;

                orderButton.textContent =
                    "Send Order via WhatsApp";

                return;
            }


            // ==========================================
            // SUCCESS
            // ==========================================

            console.log(
                "Food order saved successfully."
            );


            // ==========================================
            // WHATSAPP MESSAGE
            // ==========================================

            let message =
                "SJ DINING FOOD ORDER\n\n";


            message +=
                "Customer: " +
                customerName +
                "\n";


            message +=
                "WhatsApp: " +
                cleanPhone +
                "\n";


            message +=
                "Table: " +
                tableNumber +
                "\n\n";


            message +=
                "ORDER ITEMS\n";


            cart.forEach(function (item) {

                const itemTotal =
                    item.price *
                    item.quantity;


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
                "\n\nPlease confirm my food order.";


            // ==========================================
            // SJ DINING WHATSAPP
            // ==========================================

            const restaurantNumber =
                "919094971556";


            const whatsappURL =
                "https://wa.me/" +
                restaurantNumber +
                "?text=" +
                encodeURIComponent(message);


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