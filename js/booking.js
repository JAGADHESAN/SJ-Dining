document
    .getElementById("bookingForm")
    .addEventListener("submit", function (event) {

        event.preventDefault();


        // =========================
        // SJ DINING WHATSAPP NUMBER
        // =========================

        const restaurantNumber = "919094971556";


        // =========================
        // GET FORM VALUES
        // =========================

        const name =
            document.getElementById("name").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const people =
            document.getElementById("people").value;

        const date =
            document.getElementById("date").value;

        const time =
            document.getElementById("time").value;

        const requirements =
            document
                .getElementById("requirements")
                .value
                .trim();


        // =========================
        // VALIDATION
        // =========================

        if (!name || !phone || !people || !date || !time) {

            alert(
                "Please fill in all required fields."
            );

            return;
        }


        // =========================
        // CREATE WHATSAPP MESSAGE
        // =========================

        const message =

`🍽️ SJ DINING - TABLE BOOKING

👤 Name: ${name}

📱 Customer Phone: ${phone}

👥 Number of People: ${people}

📅 Date: ${date}

⏰ Time: ${time}

📝 Special Requirements:
${requirements || "None"}

Please confirm my table booking.

Thank you!`;


        // =========================
        // WHATSAPP URL
        // =========================

        const whatsappURL =
            "https://wa.me/" +
            restaurantNumber +
            "?text=" +
            encodeURIComponent(message);


        // =========================
        // OPEN WHATSAPP
        // =========================

        window.open(
            whatsappURL,
            "_blank"
        );

    });