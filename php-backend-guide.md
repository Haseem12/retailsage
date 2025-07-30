# PHP Backend Guide for RetailLab

This guide provides the necessary PHP code and database setup to create the authentication backend for your RetailLab application.

The frontend sends `POST` requests with a JSON body to the following endpoints:
- **/api/auth/signup**
- **/api/auth/login**

You will need a web server (like Apache or Nginx) with PHP and a MySQL database.

## 1. File Structure

Organize your backend files in a directory structure like this on your server (e.g., inside `retaillab/api/auth/`):

```
/api
└── /auth
    ├── config.php
    ├── login.php
    └── signup.php
```

## 2. Database Setup

First, you need a table in your MySQL database to store user information. Connect to your database and run the following SQL query:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

This table will store the user's email, a hashed password, and a registration timestamp.

## 3. Configuration File (`config.php`)

Create a `config.php` file to securely store your database connection details.

```php
<?php
// /api/auth/config.php

define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'your_db_username');
define('DB_PASSWORD', 'your_db_password');
define('DB_NAME', 'your_db_name');

// Attempt to connect to MySQL database
$link = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check connection
if($link === false){
    die("ERROR: Could not connect. " . mysqli_connect_error());
}

// Set headers for CORS and JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

?>
```

## 4. Signup Script (`signup.php`)

This script will handle new user registrations. It receives an email and password, validates them, hashes the password, and saves the new user to the database.

```php
<?php
// /api/auth/signup.php

include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->email) &&
    !empty($data->password)
) {
    $email = mysqli_real_escape_string($link, $data->email);
    $password = $data->password;

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["message" => "Invalid email format."]);
        exit();
    }
    
    // Check if email already exists
    $sql_check = "SELECT id FROM users WHERE email = ?";
    $stmt_check = mysqli_prepare($link, $sql_check);
    mysqli_stmt_bind_param($stmt_check, "s", $email);
    mysqli_stmt_execute($stmt_check);
    mysqli_stmt_store_result($stmt_check);

    if (mysqli_stmt_num_rows($stmt_check) > 0) {
        http_response_code(409); // Conflict
        echo json_encode(["message" => "Email already exists."]);
        mysqli_stmt_close($stmt_check);
        exit();
    }
    mysqli_stmt_close($stmt_check);

    // Hash the password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $sql_insert = "INSERT INTO users (email, password) VALUES (?, ?)";
    $stmt_insert = mysqli_prepare($link, $sql_insert);

    if ($stmt_insert) {
        mysqli_stmt_bind_param($stmt_insert, "ss", $email, $hashed_password);
        if (mysqli_stmt_execute($stmt_insert)) {
            http_response_code(201); // Created
            echo json_encode(["message" => "User was successfully registered."]);
        } else {
            http_response_code(503); // Service Unavailable
            echo json_encode(["message" => "Unable to register the user."]);
        }
        mysqli_stmt_close($stmt_insert);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Internal server error."]);
    }

} else {
    http_response_code(400); // Bad Request
    echo json_encode(["message" => "Unable to register user. Data is incomplete."]);
}

mysqli_close($link);
?>
```

## 5. Login Script (`login.php`)

This script handles user login. It checks the provided email and password against the stored hashed password.

```php
<?php
// /api/auth/login.php

include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->email) &&
    !empty($data->password)
) {
    $email = mysqli_real_escape_string($link, $data->email);
    $password = $data->password;

    $sql = "SELECT id, email, password FROM users WHERE email = ?";
    $stmt = mysqli_prepare($link, $sql);
    
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "s", $email);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if (mysqli_num_rows($result) == 1) {
            $row = mysqli_fetch_assoc($result);
            $hashed_password = $row['password'];

            if (password_verify($password, $hashed_password)) {
                // For this simulation, we send a simple token.
                // In a real application, you should generate a secure JWT (JSON Web Token) here.
                $token = "mock-token-for-" . $row['id'] . "-" . time();

                http_response_code(200);
                echo json_encode([
                    "message" => "Successful login.",
                    "token" => $token
                ]);
            } else {
                http_response_code(401); // Unauthorized
                echo json_encode(["message" => "Login failed. Incorrect password."]);
            }
        } else {
            http_response_code(404); // Not Found
            echo json_encode(["message" => "Login failed. User not found."]);
        }
        mysqli_stmt_close($stmt);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Internal server error."]);
    }

} else {
    http_response_code(400);
    echo json_encode(["message" => "Login failed. Data is incomplete."]);
}

mysqli_close($link);
?>
```

### How to Use

1.  **Upload these files** to your web server at `https://arewaskills.com.ng/retaillab/api/auth/`.
2.  **Update `config.php`** with your actual database credentials.
3.  **Test the endpoints** using your frontend application. The signup and login forms should now work with your PHP backend.

This guide should give you a solid foundation for your authentication system. Let me know if you have any questions about the frontend code!