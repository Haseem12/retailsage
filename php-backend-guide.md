# PHP Backend Guide for RetailLab

This guide provides the necessary PHP code and database setup to create the authentication and business setup backend for your RetailLab application.

The frontend sends `POST` requests with a JSON body to the following endpoints:
- **/api/auth/signup.php**
- **/api/auth/login.php**
- **/api/business-details.php**
- **/api/products.php**
- **/api/sales.php**
- **/api/spoilage.php**
- **/api/data.php**


You will need a web server (like Apache or Nginx) with PHP and a MySQL database.

## 1. File Structure

Organize your backend files in a directory structure like this on your server:

```
/retaillab
├── /api
│   ├── /auth
│   │   ├── config.php
│   │   ├── login.php
│   │   └── signup.php
│   ├── business-details.php 
│   ├── products.php
│   ├── sales.php
│   ├── spoilage.php
│   └── data.php
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
```sql
CREATE TABLE business_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    business_address TEXT NOT NULL,
    shop_type VARCHAR(100) NOT NULL,
    rc_number VARCHAR(100),
    phone_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Products Table:**
```sql
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    category VARCHAR(100),
    barcode VARCHAR(255),
    description TEXT,
    icon VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Sales Table:**
```sql
CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Sale Items Table:**
```sql
CREATE TABLE sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
);
```

**Spoilage Table:**
```sql
CREATE TABLE spoilage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    productName VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    reason VARCHAR(255),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 3. Configuration File (`/api/auth/config.php`)

This file contains database connection details and helper functions.

```php
<?php
// /api/auth/config.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(204);
    exit();
}

define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'your_db_username');
define('DB_PASSWORD', 'your_db_password');
define('DB_NAME', 'your_db_name');

$link = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

if($link === false){
    http_response_code(500);
    echo json_encode(["message" => "ERROR: Could not connect to database."]);
    exit();
}

function get_user_id_from_token($link) {
    $headers = apache_request_headers();
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        list($jwt) = sscanf($authHeader, 'Bearer %s');
        if ($jwt) {
            // In a real app, you would decode the JWT and verify it.
            // For this mock setup, we assume the token is in the format "mock-token-for-USERID-TIMESTAMP"
            $parts = explode('-', $jwt);
            if (count($parts) === 4 && $parts[0] === 'mock' && $parts[1] === 'token' && $parts[2] === 'for') {
                return (int)$parts[3];
            }
        }
    }
    return null;
}
?>
```

## 4. Login Script (`/api/auth/login.php`)

Updated to return more business details.

```php
<?php
// /api/auth/login.php
include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    $email = mysqli_real_escape_string($link, $data->email);
    $password = $data->password;

    $sql = "SELECT u.id, u.email, u.password, bd.shop_type, bd.business_name, bd.business_address, bd.rc_number, bd.phone_number 
            FROM users u
            LEFT JOIN business_details bd ON u.id = bd.user_id
            WHERE u.email = ?";
            
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
                    "token" => $token,
                    "shopType" => $row['shop_type'],
                    "businessName" => $row['business_name'],
                    "businessAddress" => $row['business_address'],
                    "rcNumber" => $row['rc_number'],
                    "phoneNumber" => $row['phone_number']
                ]);
            } else {
                http_response_code(401);
                echo json_encode(["message" => "Login failed. Incorrect password."]);
            }
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Login failed. User not found."]);
        }
        mysqli_stmt_close($stmt);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Login failed. Data is incomplete."]);
}
mysqli_close($link);
?>
```

## 5. New API Scripts

Create the following files in `/api/`.

### `/api/products.php`
```php
<?php
include_once 'auth/config.php';
$user_id = get_user_id_from_token($link);
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $action = $data->action ?? null;

    if ($action == 'create') {
        // Create product logic
    } elseif ($action == 'update') {
        // Update product logic
    } elseif ($action == 'delete') {
        // Delete product logic
    }
} elseif ($method == 'GET') {
    $action = $_GET['action'] ?? null;
    if ($action == 'read') {
        $sql = "SELECT * FROM products WHERE user_id = ?";
        if($stmt = mysqli_prepare($link, $sql)){
            mysqli_stmt_bind_param($stmt, "i", $user_id);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            $products = mysqli_fetch_all($result, MYSQLI_ASSOC);
            echo json_encode(["products" => $products]);
        }
    }
}
// Implement create, update, delete logic as needed, similar to other scripts.
// Ensure to handle all data from $data object and bind params to prevent SQL injection.
?>
```

### `/api/sales.php`
```php
<?php
include_once 'auth/config.php';
$user_id = get_user_id_from_token($link);

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
     if (!$user_id) { http_response_code(401); echo json_encode(["message" => "Unauthorized"]); exit(); }
    $data = json_decode(file_get_contents("php://input"));
    $action = $data->action ?? null;

    if ($action == 'create') {
        mysqli_begin_transaction($link);
        try {
            $sql_sale = "INSERT INTO sales (user_id, total) VALUES (?, ?)";
            $stmt_sale = mysqli_prepare($link, $sql_sale);
            mysqli_stmt_bind_param($stmt_sale, "id", $user_id, $data->total);
            mysqli_stmt_execute($stmt_sale);
            $sale_id = mysqli_insert_id($link);

            $sql_item = "INSERT INTO sale_items (sale_id, product_id, quantity, price, name) VALUES (?, ?, ?, ?, ?)";
            $stmt_item = mysqli_prepare($link, $sql_item);
            
            foreach($data->items as $item) {
                mysqli_stmt_bind_param($stmt_item, "iiids", $sale_id, $item->product_id, $item->quantity, $item->price, $item->name);
                mysqli_stmt_execute($stmt_item);

                // Update stock
                $sql_stock = "UPDATE products SET stock = stock - ? WHERE id = ? AND user_id = ?";
                $stmt_stock = mysqli_prepare($link, $sql_stock);
                mysqli_stmt_bind_param($stmt_stock, "iii", $item->quantity, $item->product_id, $user_id);
                mysqli_stmt_execute($stmt_stock);
            }
            
            mysqli_commit($link);
            http_response_code(201);
            echo json_encode(["message" => "Sale created successfully", "sale_id" => $sale_id]);

        } catch (mysqli_sql_exception $exception) {
            mysqli_rollback($link);
            http_response_code(500);
            echo json_encode(["message" => "Failed to create sale", "error" => $exception->getMessage()]);
        }
    }
} elseif ($method == 'GET') {
    $action = $_GET['action'] ?? null;
    $id = $_GET['id'] ?? null;

    if ($action == 'read') {
         if (!$user_id) { http_response_code(401); echo json_encode(["message" => "Unauthorized"]); exit(); }
        // Fetch all sales for the user
        // You will need to join with sale_items to get the full sale details
    } elseif ($action == 'read_single' && $id) {
        // No user_id check here, as it's for the printer and may not have a token.
        // In a real app, this should be a secured, signed URL.
        $sql = "SELECT s.id, s.total, s.date, bd.business_name, bd.business_address, bd.rc_number, bd.phone_number 
                FROM sales s
                JOIN users u ON s.user_id = u.id
                LEFT JOIN business_details bd ON u.id = bd.user_id
                WHERE s.id = ?";
        if ($stmt = mysqli_prepare($link, $sql)) {
            mysqli_stmt_bind_param($stmt, "i", $id);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            $sale = mysqli_fetch_assoc($result);

            if($sale) {
                $sql_items = "SELECT name, quantity, price FROM sale_items WHERE sale_id = ?";
                $stmt_items = mysqli_prepare($link, $sql_items);
                mysqli_stmt_bind_param($stmt_items, "i", $id);
                mysqli_stmt_execute($stmt_items);
                $result_items = mysqli_stmt_get_result($stmt_items);
                $sale['items'] = mysqli_fetch_all($result_items, MYSQLI_ASSOC);
            }
            echo json_encode($sale);
        }
    }
}
// Implement the read logic to fetch all sales and their items for a user.
?>
```

### `/api/spoilage.php` & `/api/data.php`
You will need to create these files and implement the logic for `create`, `read`, `delete` (for spoilage) and `backup`, `restore` (for data) following the patterns above. Remember to always authorize the user with `get_user_id_from_token()` for actions that modify or read sensitive data.
