# PHP Backend Guide for RetailLab

This guide provides the necessary PHP code and database setup to create the authentication and business setup backend for your RetailLab application.

The frontend sends `POST` requests with a JSON body to the following endpoints:
- **/api/auth/signup**
- **/api/auth/login**
- **/api/business-details**

You will need a web server (like Apache or Nginx) with PHP and a MySQL database.

## 1. File Structure

Organize your backend files in a directory structure like this on your server:

```
/api
├── /auth
│   ├── config.php
│   ├── login.php
│   └── signup.php
└── business-details.php 
```

## 2. Database Setup

First, you need tables in your MySQL database to store user and business information. Connect to your database and run the following SQL queries:

**Users Table:**
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Business Details Table:**
This table stores the information from the welcome form. The `user_id` column links these details to a specific user.
```sql
CREATE TABLE business_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    business_address TEXT NOT NULL,
    shop_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 3. Configuration File (`/api/auth/config.php`)

Create a `config.php` file to securely store your database connection details. This file will be included by all other scripts.

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
    // In a real app, you would log this error, not expose it.
    die("ERROR: Could not connect. " . mysqli_connect_error());
}

// Set headers for CORS and JSON response
function set_headers() {
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    set_headers();
    exit(0);
}

set_headers();

?>
```

## 4. Signup Script (`/api/auth/signup.php`)

This script handles new user registrations. It now returns the `userId` upon successful registration, which you can use to link to the business details.

```php
<?php
// /api/auth/signup.php

include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    $email = mysqli_real_escape_string($link, $data->email);
    $password = $data->password;

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["message" => "Invalid email format."]);
        exit();
    }
    
    $sql_check = "SELECT id FROM users WHERE email = ?";
    if ($stmt_check = mysqli_prepare($link, $sql_check)) {
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
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $sql_insert = "INSERT INTO users (email, password) VALUES (?, ?)";
    if ($stmt_insert = mysqli_prepare($link, $sql_insert)) {
        mysqli_stmt_bind_param($stmt_insert, "ss", $email, $hashed_password);
        if (mysqli_stmt_execute($stmt_insert)) {
            $user_id = mysqli_insert_id($link); // Get the new user's ID
            http_response_code(201); // Created
            echo json_encode([
                "message" => "User was successfully registered.",
                "userId" => $user_id 
            ]);
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

## 5. Login Script (`/api/auth/login.php`)

This script handles user login.

```php
<?php
// /api/auth/login.php

include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    $email = mysqli_real_escape_string($link, $data->email);
    $password = $data->password;

    $sql = "SELECT id, email, password FROM users WHERE email = ?";
    if ($stmt = mysqli_prepare($link, $sql)) {
        mysqli_stmt_bind_param($stmt, "s", $email);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if (mysqli_num_rows($result) == 1) {
            $row = mysqli_fetch_assoc($result);
            $hashed_password = $row['password'];

            if (password_verify($password, $hashed_password)) {
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

## 6. Business Details Script (`/api/business-details.php`)

This script will handle the form submission from the welcome page.

```php
<?php
// /api/business-details.php

// Note: This config file is one directory up
include_once 'auth/config.php';

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->userId) &&
    !empty($data->businessName) &&
    !empty($data->businessAddress) &&
    !empty($data->shopType)
) {
    $user_id = mysqli_real_escape_string($link, $data->userId);
    $business_name = mysqli_real_escape_string($link, $data->businessName);
    $business_address = mysqli_real_escape_string($link, $data->businessAddress);
    $shop_type = mysqli_real_escape_string($link, $data->shopType);

    // Optional: Check if the user ID exists in the users table
    $sql_check = "SELECT id FROM users WHERE id = ?";
    if($stmt_check = mysqli_prepare($link, $sql_check)) {
        mysqli_stmt_bind_param($stmt_check, "i", $user_id);
        mysqli_stmt_execute($stmt_check);
        mysqli_stmt_store_result($stmt_check);
        if(mysqli_stmt_num_rows($stmt_check) == 0){
             http_response_code(404);
             echo json_encode(["message" => "User not found."]);
             exit();
        }
        mysqli_stmt_close($stmt_check);
    }

    $sql = "INSERT INTO business_details (user_id, business_name, business_address, shop_type) VALUES (?, ?, ?, ?)";
    
    if ($stmt = mysqli_prepare($link, $sql)) {
        mysqli_stmt_bind_param($stmt, "isss", $user_id, $business_name, $business_address, $shop_type);
        
        if (mysqli_stmt_execute($stmt)) {
            http_response_code(201); // Created
            echo json_encode(["message" => "Business details saved successfully."]);
        } else {
            http_response_code(503); // Service Unavailable
            echo json_encode(["message" => "Unable to save business details."]);
        }
        mysqli_stmt_close($stmt);
    } else {
         http_response_code(500); // Internal Server Error
         echo json_encode(["message" => "Database statement preparation failed."]);
    }
} else {
    http_response_code(400); // Bad Request
    echo json_encode(["message" => "Incomplete data provided."]);
}

mysqli_close($link);
?>
```

### How to Use

1.  **Upload these files** to your web server according to the file structure.
2.  **Update `/api/auth/config.php`** with your actual database credentials.
3.  **Create the database tables** using the SQL queries provided.
4.  **Test the endpoints** using your frontend application. The signup flow, welcome form, and login should now work with your PHP backend.

This guide should give you a solid foundation for your authentication and business setup system. Let me know if you have any questions about the frontend code!
