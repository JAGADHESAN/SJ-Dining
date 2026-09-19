document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("bookingForm");

    console.log("SJ Dining booking page loaded.");

    if (!form) {
        console.error("bookingForm not found.");
        return;
    }

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        console.log("Booking form submitted.");

        const name = document.getElementById("name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const people = document.getElementById("people").value;
        const date = document.getElementById("date").value;
        const time = document.getElementById("time").value;
        const requirements =
            document.getElementById("requirements").value.trim();

        if (!name || !phone || !people || !date || !time) {
            alert("Please fill in all required fields.");
            return;
        }

        if (typeof supabaseClient === "undefined") {
            alert("Supabase connection failed.");
            return;
        }

        try {

            console.log("Saving booking to Supabase...");

            const { error } = await supabaseClient
                .from("bookings")
                .insert({
                    customer_name: name,
                    phone: phone,
                    number_of_people: parseInt(people),
                    booking_date: date,
                    booking_time: time,
                    special_requirements: requirements || null,
                    status: "pending"
                });

            if (error) {

                console.error("SUPABASE ERROR:", error);

                alert(
                    "Booking could not be saved.\n\n" +
                    error.message
                );

                return;
            }

            console.log("Booking saved successfully.");

            // Create WhatsApp message
            const message =
                "SJ DINING BOOKING\n\n" +
                "Name: " + name + "\n" +
                "Phone: " + phone + "\n" +
                "Number of People: " + people + "\n" +
                "Date: " + date + "\n" +
                "Time: " + time + "\n" +
                "Special Requirements: " +
                (requirements || "None");

            // SJ Dining WhatsApp number
            const whatsappNumber = "919094971556";

            // Official WhatsApp Click-to-Chat format
            const whatsappURL =
                "https://wa.me/" +
                whatsappNumber +
                "?text=" +
                encodeURIComponent(message);

            console.log("Opening WhatsApp...");
            console.log(whatsappURL);

            alert(
                "Booking saved successfully!\n\n" +
                "Opening WhatsApp..."
            );

            // Redirect directly to WhatsApp
            window.location.href = whatsappURL;

        } catch (error) {

            console.error("UNEXPECTED ERROR:", error);

            alert(
                "Something went wrong.\n\n" +
                error.message
            );
        }

    });

});