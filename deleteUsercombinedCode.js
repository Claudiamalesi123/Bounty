// combinedCode.js

// Backend setup with Express
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Mock user model for demonstration purposes
const UserModel = {
    destroy: async ({ where }) => {
        const { username } = where;
        console.log(`User with username ${username} deleted.`); // Simulating deletion
        return true; // Simulating success
    },
    findOne: async ({ where }) => {
        const { username } = where;
        if (username === 'existingUser') {
            return { username }; // Simulating found user
        }
        return null; // Simulating user not found
    }
};

// Middleware for authentication and authorization
const authentication = (req, res, next) => {
    // Placeholder for actual authentication logic
    console.log('Authentication passed');
    next();
};

const authorisation = (options) => (req, res, next) => {
    // Placeholder for actual authorization logic
    console.log(`Authorization passed with options: ${JSON.stringify(options)}`);
    next();
};

// Initialize Express app
const app = express();
const PORT = 4001;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' directory

// Function to delete a user by username
const delete_user_by_username = async (req, res) => {
    const { username } = req.body;

    try {
        // Check if user exists
        const user = await UserModel.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete user
        await UserModel.destroy({
            where: {
                username
            }
        });

        // Respond with success message
        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Route to handle user deletion
app.post('/auth/delete/user', authentication, authorisation({ isAdmin: false }), delete_user_by_username);

// Serve HTML content directly (Frontend)
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>User Management</title>
    </head>
    <body>
        <h1>User Management</h1>
        <!-- Delete User Form -->
        <form id="delete-user-form">
            <label for="other-username">Username to Delete:</label>
            <input type="text" id="other-username" name="username" required>
            <button type="submit">Delete User</button>
        </form>

        <script>
            document.getElementById("delete-user-form").addEventListener("submit", async (event) => {
                event.preventDefault();
                const username = document.getElementById("other-username").value;

                try {
                    const response = await fetch('http://localhost:4001/auth/delete/user', {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ username })
                    });

                    const result = await response.json();

                    if (response.ok) {
                        alert(result.message);
                    } else {
                        alert(\`Error: \${result.message}\`);
                    }
                } catch (error) {
                    console.error('Error deleting user:', error);
                    alert('An error occurred while deleting the user. Please try again later.');
                }
            });
        </script>
    </body>
    </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
