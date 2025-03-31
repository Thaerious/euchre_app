// Event listener that waits for the page to fully load before executing
window.addEventListener("load", async () => {
    // if (await checkStatus()) window.location = "/landing"

    // Adds a click event listener to the login button
    document.querySelector("#login_button").addEventListener("click", () => {
        const username = document.getElementById("username_txt").value.trim();
        const password = document.getElementById("password_txt").value.trim();

        if (!username || !password) {
            alert("All fields are required!");
            return;
        }

        login(username, password)
    });    

    // Adds a click event listener to the login button
    document.querySelector("#create_button").addEventListener("click", () => {
        window.location = "/create"
    });        
});

async function login(username, password) {
    const body = JSON.stringify({
        username: username,
        password: password
    })

    const response = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: body
    })
    
    const data = await response.json()

    switch (response.status) {
        case 200:
            window.location = "/landing"
            break;
        default:
            window.alert(data.message)
            break;
    }
}