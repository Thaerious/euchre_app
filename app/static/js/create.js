// Event listener that waits for the page to fully load before executing
window.addEventListener("load", async () => {
    // if (await checkStatus()) window.location = "/landing"

    // Adds a click event listener to the login button
    document.querySelector("#create_button").addEventListener("click", () => {
        const username = document.getElementById("username_txt").value.trim();
        const email = document.getElementById("email_txt").value.trim();
        const password = document.getElementById("password_txt").value.trim();
        const verifyPassword = document.getElementById("verify_txt").value.trim();

        if (!username || !email || !password || !verifyPassword) {
            alert("All fields are required!");
            return;
        }

        if (password !== verifyPassword) {
            alert("Passwords do not match!");
            return;
        }

        create(username, email, password)
    });    

    // Adds a click event listener to the login button
    document.querySelector("#back_button").addEventListener("click", () => {
        window.location = "/"
    });        
});

async function create(username, email, password) {
    const body = JSON.stringify({
        username: username,
        email: email,
        password: password
    })

    const response = await fetch("/create_account", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: body
    })    
    
    const data = await response.json()

    switch (response.status) {
        case 200:
        case 201:
            window.location = "/"
            break;
        case 409:
            window.alert(data.message)
            break;
        case 500:
            window.alert(data.message)
            break;        
    }
}

