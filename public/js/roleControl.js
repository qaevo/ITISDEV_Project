
document.addEventListener("DOMContentLoaded", () => {
    // Fetch user information and role
    fetch("/api/getUsername")
      .then((response) => response.json())
      .then((data) => {
        const usernameElement = document.getElementById("username");
        usernameElement.textContent = data.username || "Guest";
  
        const userRole = data.role || "guest";
  
        // Show or hide elements based on user role
        const adminElements = document.querySelectorAll(".admin-only");
        adminElements.forEach((el) => {
          if (userRole === "admin") {
            el.style.display = "block"; // Show admin elements
          } else {
            el.style.display = "none"; // Hide admin elements for non-admin users
          }
        });
  
        // Redirect users to appropriate dashboards
        if (window.location.pathname === "/login.html") {
          // Check if the user is already logged in
          if (userRole === "admin") {
            window.location.href = "/admindashboard.html"; // Redirect admin to admin dashboard
          } else if (userRole === "user") {
            window.location.href = "/dashboard.html"; // Redirect regular user to regular dashboard
          }
        } else {
          // Redirect non-admin users trying to access admin pages
          const isOnAdminPage = window.location.pathname.includes("admin");
          if (isOnAdminPage && userRole !== "admin") {
            window.location.href = "/dashboard.html"; // Redirect non-admin to regular dashboard
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching user information:", error);
        document.getElementById("username").textContent = "Guest"; // Fallback text
      });
  
    // Logout button functionality
    document.getElementById("logoutBtn").addEventListener("click", (event) => {
      event.preventDefault(); // Prevent default action
  
      fetch("/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((response) => {
        if (response.ok) {
          window.location.href = "index.html"; // Redirect to index page after logout
        } else {
          alert("Logout failed");
        }
      });
    });
  });
  