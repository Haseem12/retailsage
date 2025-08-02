
# PHP Backend Guide for RetailLab

This guide provides the necessary PHP code and database setup to create the authentication and business logic backend for your RetailLab application.

The frontend sends `POST` requests with a JSON body to the following endpoints:
- **/api/auth/signup.php**
- **/api/auth/login.php**
- **/api/business-details.php**
- **/api/products.php**
- **/api/sales.php**
- **/api/spoilage.php**
- **/api/data.php**
- **/api/users.php**
- **/print/response.php**


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
│   ├── data.php
│   └── users.php
└── /print
    └── response.php
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
    user_id INT NOT NULL UNIQUE,
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
    $authHeader = $headers['Authorization'] ?? null;
    if ($authHeader) {
        list($jwt) = sscanf($authHeader, 'Bearer %s');
        if ($jwt) {
            // In a real app, you would decode the JWT and verify it.
            // For this mock setup, we assume the token is in the format "mock-token-for-USERID-TIMESTAMP"
            $parts = explode('-', $jwt);
            if (count($parts) >= 4 && $parts[0] === 'mock' && $parts[1] === 'token' && $parts[2] === 'for') {
                return (int)$parts[3];
            }
        }
    }
    return null;
}
```

## 4. Auth and Business Setup Scripts

### `/api/auth/signup.php`
```php
<?php
// /api/auth/signup.php
require_once __DIR__ . '/config.php';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->email) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
    exit();
}

$email = mysqli_real_escape_string($link, $data->email);
$password = password_hash($data->password, PASSWORD_DEFAULT);

$sql = "INSERT INTO users (email, password) VALUES (?, ?)";

if ($stmt = mysqli_prepare($link, $sql)) {
    mysqli_stmt_bind_param($stmt, "ss", $email, $password);
    if (mysqli_stmt_execute($stmt)) {
        http_response_code(201);
        echo json_encode(["message" => "User created.", "userId" => mysqli_insert_id($link)]);
    } else {
        http_response_code(409); // Conflict
        echo json_encode(["message" => "User with this email already exists."]);
    }
    mysqli_stmt_close($stmt);
}
mysqli_close($link);
```

### `/api/auth/login.php`
```php
<?php
// /api/auth/login.php
require_once __DIR__ . '/config.php';

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
```

### `/api/business-details.php`
```php
<?php
// /api/business-details.php
require_once __DIR__ . '/auth/config.php';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->userId) || empty($data->businessName) || empty($data->businessAddress) || empty($data->shopType)) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data for business setup."]);
    exit();
}

$user_id = (int)$data->userId;
$business_name = mysqli_real_escape_string($link, $data->businessName);
$business_address = mysqli_real_escape_string($link, $data->businessAddress);
$shop_type = mysqli_real_escape_string($link, $data->shopType);
$rc_number = isset($data->rcNumber) ? mysqli_real_escape_string($link, $data->rcNumber) : null;
$phone_number = isset($data->phoneNumber) ? mysqli_real_escape_string($link, $data->phoneNumber) : null;

// Using INSERT ... ON DUPLICATE KEY UPDATE to handle both new and existing entries
$sql = "INSERT INTO business_details (user_id, business_name, business_address, shop_type, rc_number, phone_number) VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE business_name = VALUES(business_name), business_address = VALUES(business_address), shop_type = VALUES(shop_type), rc_number = VALUES(rc_number), phone_number = VALUES(phone_number)";

if ($stmt = mysqli_prepare($link, $sql)) {
    mysqli_stmt_bind_param($stmt, "isssss", $user_id, $business_name, $business_address, $shop_type, $rc_number, $phone_number);
    if (mysqli_stmt_execute($stmt)) {
        http_response_code(201);
        echo json_encode(["message" => "Business details saved successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Failed to save business details."]);
    }
    mysqli_stmt_close($stmt);
}
mysqli_close($link);
```

## 5. Main API Scripts

### `/api/products.php`
```php
<?php
// /api/products.php
require_once __DIR__ . '/auth/config.php';
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
        $sql = "INSERT INTO products (user_id, name, price, stock, category, barcode, description, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        if($stmt = mysqli_prepare($link, $sql)){
            mysqli_stmt_bind_param($stmt, "isdissss", $user_id, $data->name, $data->price, $data->stock, $data->category, $data->barcode, $data->description, $data->icon);
            mysqli_stmt_execute($stmt);
            http_response_code(201);
            echo json_encode(["message" => "Product created", "id" => mysqli_insert_id($link)]);
        }
    } elseif ($action == 'update') {
        $sql = "UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ? AND user_id = ?";
        if($stmt = mysqli_prepare($link, $sql)){
            mysqli_stmt_bind_param($stmt, "sdiii", $data->name, $data->price, $data->stock, $data->id, $user_id);
            mysqli_stmt_execute($stmt);
            http_response_code(200);
            echo json_encode(["message" => "Product updated"]);
        }
    } elseif ($action == 'delete') {
        $sql = "DELETE FROM products WHERE id = ? AND user_id = ?";
         if($stmt = mysqli_prepare($link, $sql)){
            mysqli_stmt_bind_param($stmt, "ii", $data->id, $user_id);
            mysqli_stmt_execute($stmt);
            http_response_code(200);
            echo json_encode(["message" => "Product deleted"]);
        }
    }
} elseif ($method == 'GET') {
    $sql = "SELECT id, name, price, stock, category, barcode, description, icon FROM products WHERE user_id = ?";
    if($stmt = mysqli_prepare($link, $sql)){
        mysqli_stmt_bind_param($stmt, "i", $user_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $products = mysqli_fetch_all($result, MYSQLI_ASSOC);
        echo json_encode(["products" => $products]);
    }
}
mysqli_close($link);
```

### `/api/sales.php`
```php
<?php
// /api/sales.php
require_once __DIR__ . '/auth/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $user_id = get_user_id_from_token($link);
    if (!$user_id) { http_response_code(401); echo json_encode(["message" => "Unauthorized"]); exit(); }

    $data = json_decode(file_get_contents("php://input"));
    mysqli_begin_transaction($link);
    try {
        // Create the main sale record
        $sql_sale = "INSERT INTO sales (user_id, total) VALUES (?, ?)";
        $stmt_sale = mysqli_prepare($link, $sql_sale);
        mysqli_stmt_bind_param($stmt_sale, "id", $user_id, $data->total);
        mysqli_stmt_execute($stmt_sale);
        $sale_id = mysqli_insert_id($link);

        // Insert sale items and update stock
        $sql_item = "INSERT INTO sale_items (sale_id, product_id, quantity, price, name) VALUES (?, ?, ?, ?, ?)";
        $stmt_item = mysqli_prepare($link, $sql_item);

        $sql_stock = "UPDATE products SET stock = stock - ? WHERE id = ? AND user_id = ?";
        $stmt_stock = mysqli_prepare($link, $sql_stock);

        foreach($data->items as $item) {
            $product_info_sql = "SELECT name FROM products WHERE id = ?";
            $product_info_stmt = mysqli_prepare($link, $product_info_sql);
            mysqli_stmt_bind_param($product_info_stmt, "i", $item->product_id);
            mysqli_stmt_execute($product_info_stmt);
            $product_result = mysqli_stmt_get_result($product_info_stmt);
            $product_info = mysqli_fetch_assoc($product_result);
            $item_name = $product_info['name'];

            mysqli_stmt_bind_param($stmt_item, "iiids", $sale_id, $item->product_id, $item->quantity, $item->price, $item_name);
            mysqli_stmt_execute($stmt_item);
            
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

} elseif ($method == 'GET') {
    $action = $_GET['action'] ?? null;
    
    if ($action == 'read') {
        $user_id = get_user_id_from_token($link);
        if (!$user_id) { http_response_code(401); echo json_encode(["message" => "Unauthorized"]); exit(); }

        $sql = "SELECT s.id, s.total, s.date, si.name, si.quantity, si.price 
                FROM sales s
                LEFT JOIN sale_items si ON s.id = si.sale_id
                WHERE s.user_id = ?
                ORDER BY s.date DESC, s.id DESC";

        $stmt = mysqli_prepare($link, $sql);
        mysqli_stmt_bind_param($stmt, "i", $user_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);

        $sales_data = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $sale_id = $row['id'];
            if (!isset($sales_data[$sale_id])) {
                $sales_data[$sale_id] = [
                    'id' => $sale_id,
                    'total' => $row['total'],
                    'date' => $row['date'],
                    'items' => []
                ];
            }
            if ($row['name']) { // Ensure there is an item to add
                $sales_data[$sale_id]['items'][] = [
                    'name' => $row['name'],
                    'quantity' => $row['quantity'],
                    'price' => $row['price']
                ];
            }
        }
        
        echo json_encode(["sales" => array_values($sales_data)]);


    } elseif ($action == 'read_single') {
        $id = $_GET['id'] ?? null;
        if (!$id) { http_response_code(400); echo json_encode(["message" => "No ID provided"]); exit(); }

        $sql = "SELECT s.id, s.total, s.date, s.user_id, bd.business_name, bd.business_address, bd.rc_number, bd.phone_number 
                FROM sales s
                LEFT JOIN users u ON s.user_id = u.id
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
                echo json_encode($sale);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Sale not found"]);
            }
        }
    }
}
mysqli_close($link);
```

### `/api/spoilage.php`
```php
<?php
// /api/spoilage.php
require_once __DIR__ . '/auth/config.php';
$user_id = get_user_id_from_token($link);
if (!$user_id) { http_response_code(401); echo json_encode(["message" => "Unauthorized"]); exit(); }

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $action = $data->action ?? null;

    if ($action == 'create') {
        mysqli_begin_transaction($link);
        try {
            // Get product name
            $p_sql = "SELECT name FROM products WHERE id = ? AND user_id = ?";
            $p_stmt = mysqli_prepare($link, $p_sql);
            mysqli_stmt_bind_param($p_stmt, "ii", $data->product_id, $user_id);
            mysqli_stmt_execute($p_stmt);
            $p_res = mysqli_stmt_get_result($p_stmt);
            $product = mysqli_fetch_assoc($p_res);
            $productName = $product['name'];

            // Insert spoilage record
            $sql = "INSERT INTO spoilage (user_id, product_id, productName, quantity, reason) VALUES (?, ?, ?, ?, ?)";
            $stmt = mysqli_prepare($link, $sql);
            mysqli_stmt_bind_param($stmt, "iisis", $user_id, $data->product_id, $productName, $data->quantity, $data->reason);
            mysqli_stmt_execute($stmt);
            
            // Update stock
            $sql_stock = "UPDATE products SET stock = stock - ? WHERE id = ? AND user_id = ?";
            $stmt_stock = mysqli_prepare($link, $sql_stock);
            mysqli_stmt_bind_param($stmt_stock, "iii", $data->quantity, $data->product_id, $user_id);
            mysqli_stmt_execute($stmt_stock);

            mysqli_commit($link);
            http_response_code(201);
            echo json_encode(["message" => "Spoilage logged"]);
        } catch (Exception $e) {
            mysqli_rollback($link);
            http_response_code(500);
            echo json_encode(["message" => "Failed to log spoilage", "error" => $e->getMessage()]);
        }
    } elseif ($action == 'delete') {
        $sql = "DELETE FROM spoilage WHERE id = ? AND user_id = ?";
        $stmt = mysqli_prepare($link, $sql);
        mysqli_stmt_bind_param($stmt, "ii", $data->id, $user_id);
        mysqli_stmt_execute($stmt);
        http_response_code(200);
        echo json_encode(["message" => "Spoilage record deleted"]);
    }
} elseif ($method == 'GET') {
    $sql = "SELECT id, product_id as productId, productName, quantity, reason, date FROM spoilage WHERE user_id = ?";
    if($stmt = mysqli_prepare($link, $sql)){
        mysqli_stmt_bind_param($stmt, "i", $user_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $spoilage = mysqli_fetch_all($result, MYSQLI_ASSOC);
        echo json_encode(["spoilage" => $spoilage]);
    }
}
mysqli_close($link);
```

### `/api/data.php`
```php
<?php
// /api/data.php
require_once __DIR__ . '/auth/config.php';
$user_id = get_user_id_from_token($link);
if (!$user_id) { http_response_code(401); echo json_encode(["message" => "Unauthorized"]); exit(); }

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET' && $_GET['action'] == 'backup') {
    $backup_data = [];
    
    // Backup products
    $sql_products = "SELECT name, price, stock, category, barcode, description, icon FROM products WHERE user_id = ?";
    $stmt_products = mysqli_prepare($link, $sql_products);
    mysqli_stmt_bind_param($stmt_products, "i", $user_id);
    mysqli_stmt_execute($stmt_products);
    $result_products = mysqli_stmt_get_result($stmt_products);
    $backup_data['products'] = mysqli_fetch_all($result_products, MYSQLI_ASSOC);

    // Backup sales
    $sql_sales = "SELECT total, date FROM sales WHERE user_id = ?";
    $stmt_sales = mysqli_prepare($link, $sql_sales);
    mysqli_stmt_bind_param($stmt_sales, "i", $user_id);
    mysqli_stmt_execute($stmt_sales);
    $result_sales = mysqli_stmt_get_result($stmt_sales);
    $backup_data['sales'] = mysqli_fetch_all($result_sales, MYSQLI_ASSOC);
    
    // Backup spoilage
    $sql_spoilage = "SELECT productName, quantity, reason, date FROM spoilage WHERE user_id = ?";
    $stmt_spoilage = mysqli_prepare($link, $sql_spoilage);
    mysqli_stmt_bind_param($stmt_spoilage, "i", $user_id);
    mysqli_stmt_execute($stmt_spoilage);
    $result_spoilage = mysqli_stmt_get_result($stmt_spoilage);
    $backup_data['spoilage'] = mysqli_fetch_all($result_spoilage, MYSQLI_ASSOC);
    
    echo json_encode($backup_data);
    
} elseif ($method == 'POST' && $_GET['action'] == 'restore') {
    $data = json_decode(file_get_contents("php://input"), true);
    mysqli_begin_transaction($link);
    try {
        // Clear existing data
        $tables = ['products', 'sale_items', 'sales', 'spoilage'];
        foreach ($tables as $table) {
            $delete_sql = "DELETE FROM $table WHERE user_id = ?";
            $delete_stmt = mysqli_prepare($link, $delete_sql);
            mysqli_stmt_bind_param($delete_stmt, "i", $user_id);
            mysqli_stmt_execute($delete_stmt);
        }

        // Restore products
        if (!empty($data['products'])) {
            $product_sql = "INSERT INTO products (user_id, name, price, stock, category, barcode, description, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $product_stmt = mysqli_prepare($link, $product_sql);
            foreach ($data['products'] as $p) {
                mysqli_stmt_bind_param($product_stmt, "isdissss", $user_id, $p['name'], $p['price'], $p['stock'], $p['category'], $p['barcode'], $p['description'], $p['icon']);
                mysqli_stmt_execute($product_stmt);
            }
        }
        
        // Note: Restoring sales and spoilage is more complex as it involves recreating history.
        // For this guide, we keep it simple. A production system might handle this differently.
        
        mysqli_commit($link);
        http_response_code(200);
        echo json_encode(["message" => "Data restored successfully"]);

    } catch (Exception $e) {
        mysqli_rollback($link);
        http_response_code(500);
        echo json_encode(["message" => "Failed to restore data", "error" => $e->getMessage()]);
    }
}
mysqli_close($link);
```

### `/api/users.php`
```php
<?php
// /api/users.php
require_once __DIR__ . '/auth/config.php';
$user_id = get_user_id_from_token($link);
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    $action = $_GET['action'] ?? null;
    if ($action == 'read_all') {
        // This should be an admin-only action in a real app
        $sql = "SELECT u.id, u.email, bd.business_name, bd.shop_type FROM users u LEFT JOIN business_details bd ON u.id = bd.user_id";
        if($stmt = mysqli_prepare($link, $sql)){
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            $users = mysqli_fetch_all($result, MYSQLI_ASSOC);
            echo json_encode(["users" => $users]);
        }
    }
}
mysqli_close($link);
```

## 6. Printer Response Script

### `/print/response.php`

This script is called by the Bluetooth printer app. It fetches sale data by its ID and returns a JSON payload formatted as a series of commands for the printer.

```php
<?php
// /print/response.php
require_once __DIR__ . '/../api/auth/config.php';

// Function to create a standard print object
function create_print_obj($content, $type = 0, $bold = 0, $align = 0, $format = 0) {
    $obj = new stdClass();
    $obj->type = $type;
    $obj->content = $content;
    $obj->bold = $bold;
    $obj->align = $align;
    $obj->format = $format;
    return $obj;
}

// Function to create a barcode object
function create_barcode_obj($value, $width = 150, $height = 60, $align = 1) {
    $obj = new stdClass();
    $obj->type = 2; // Barcode type
    $obj->value = $value;
    $obj->width = $width;
    $obj->height = $height;
    $obj->align = $align;
    return $obj;
}


$sale_id_str = $_GET['saleId'] ?? null;
if (!$sale_id_str) {
    http_response_code(400);
    echo json_encode(["message" => "No Sale ID provided"]);
    exit();
}

// Extract numeric part from saleId (e.g., "sale_10" becomes "10")
$sale_id = (int) preg_replace('/[^0-9]/', '', $sale_id_str);

if ($sale_id <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid Sale ID format"]);
    exit();
}

// Fetch sale and business details
$sql = "SELECT s.id, s.total, s.date, s.user_id, bd.business_name, bd.business_address, bd.rc_number, bd.phone_number 
        FROM sales s
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN business_details bd ON u.id = bd.user_id
        WHERE s.id = ?";
        
$stmt = mysqli_prepare($link, $sql);
mysqli_stmt_bind_param($stmt, "i", $sale_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$sale = mysqli_fetch_assoc($result);

if (!$sale) {
    http_response_code(404);
    echo json_encode(["message" => "Sale not found"]);
    exit();
}

// Fetch sale items
$sql_items = "SELECT name, quantity, price FROM sale_items WHERE sale_id = ?";
$stmt_items = mysqli_prepare($link, $sql_items);
mysqli_stmt_bind_param($stmt_items, "i", $sale_id);
mysqli_stmt_execute($stmt_items);
$result_items = mysqli_stmt_get_result($stmt_items);
$items = mysqli_fetch_all($result_items, MYSQLI_ASSOC);
$sale['items'] = $items;

// --- Build the JSON response for the printer ---
$print_payload = array();

// Header
array_push($print_payload, create_print_obj($sale['business_name'] ?? 'RetailSage', 0, 1, 1, 2)); // Bold, Center, Double Height+Width
array_push($print_payload, create_print_obj($sale['business_address'] ?? 'Your Business Address', 0, 0, 1)); // Center
if (!empty($sale['rc_number'])) {
    array_push($print_payload, create_print_obj('RC: ' . $sale['rc_number'], 0, 0, 1));
}
if (!empty($sale['phone_number'])) {
    array_push($print_payload, create_print_obj('Tel: ' . $sale['phone_number'], 0, 0, 1));
}
array_push($print_payload, create_print_obj(date("d/m/Y h:i A", strtotime($sale['date'])), 0, 0, 1));
array_push($print_payload, create_print_obj(str_repeat('-', 32))); // Separator line

// Sale Items
foreach ($sale['items'] as $item) {
    $item_line = sprintf("%dx %s - N%s", $item['quantity'], $item['name'], number_format($item['price'] * $item['quantity'], 2));
    array_push($print_payload, create_print_obj($item_line));
}

// Footer
array_push($print_payload, create_print_obj(str_repeat('-', 32))); // Separator line
array_push($print_payload, create_print_obj("TOTAL: N" . number_format($sale['total'], 2), 0, 1, 2)); // Bold, Right align
array_push($print_payload, create_print_obj(' ', 0, 0, 0)); // Empty line
array_push($print_payload, create_print_obj('Thank you for your patronage!', 0, 1, 1));
array_push($print_payload, create_print_obj(' ', 0, 0, 0)); // Empty line

// Barcode
array_push($print_payload, create_barcode_obj(strval($sale_id)));

// Final output
// Use JSON_FORCE_OBJECT if the app expects an object, otherwise use a simple array.
// Based on your example, it seems to be a numerically indexed array, which is default for json_encode on this type of array.
echo json_encode($print_payload); 

mysqli_close($link);

?>
```
    

```