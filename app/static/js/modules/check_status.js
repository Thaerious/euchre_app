export default async function checkStatus() {
    const token = localStorage.getItem("access_token");
    if (token === null) return false

    const response = await fetch("/status", {
        method: "POST",
        headers: {
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${token}`
        },
    })
        
    if (response.ok) {
        return true
    }
    else if (response.status === 401) {
        localStorage.removeItem("access_token");
        return false
    } else {
        console.error("Unexpected response:", response.status);
    }      
}