<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$basePaths = ['/macropace-api/api', '/macropace-api', '/api'];
$path = $uri;
foreach ($basePaths as $base) {
    if (strpos($path, $base) === 0) {
        $path = substr($path, strlen($base));
        break;
    }
}
$path = '/' . trim($path, '/');

function match_route($pattern, $path, &$params = [])
{
    $regex = '#^' . preg_replace('#:([a-zA-Z0-9_]+)#', '(?P<$1>[^/]+)', $pattern) . '$#';
    if (preg_match($regex, $path, $matches)) {
        $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
        return true;
    }
    return false;
}

// 1. HEALTH CHECK
if ($method === 'GET' && ($path === '/health' || $path === '/')) {
    json_response(['status' => 'ok', 'message' => 'MacroPace XAMPP PHP API is running smoothly.']);
}

// 2. AUTHENTICATION ROUTES
// REGISTER
if ($method === 'POST' && $path === '/auth/register') {
    $input = get_json_input();
    $name = trim($input['name'] ?? '');
    $email = strtolower(trim($input['email'] ?? ''));
    $password = $input['password'] ?? '';

    if (!$name || !$email || !$password) {
        json_response(['success' => false, 'error' => 'Name, email, and password are required.'], 400);
    }

    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        json_response(['success' => false, 'error' => 'An account with this email already exists.'], 400);
    }

    $userId = 'USR-' . substr((string) time(), -6);
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $insert = $pdo->prepare('INSERT INTO users (id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, "user", "Active")');
    $insert->execute([$userId, $name, $email, $passwordHash]);

    $initProfile = $pdo->prepare('INSERT INTO health_profiles (user_id, age, gender, height_cm, weight_kg, fitness_goal, target_calories) VALUES (?, 26, "male", 175.0, 70.0, "maintenance", 2200)');
    $initProfile->execute([$userId]);

    $token = generate_jwt([
        'id' => $userId,
        'email' => $email,
        'name' => $name,
        'role' => 'user',
    ]);

    json_response([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => $userId,
            'name' => $name,
            'email' => $email,
            'role' => 'user',
            'status' => 'Active',
        ],
    ], 201);
}

// LOGIN
if ($method === 'POST' && $path === '/auth/login') {
    $input = get_json_input();
    $userIdInput = strtolower(trim($input['userId'] ?? ''));
    $password = $input['password'] ?? '';

    if (!$userIdInput || !$password) {
        json_response(['success' => false, 'error' => 'Email/ID and password are required.'], 400);
    }

    $stmt = $pdo->prepare('SELECT id, name, email, password_hash, role, status FROM users WHERE email = ? OR id = ?');
    $stmt->execute([$userIdInput, $userIdInput]);
    $user = $stmt->fetch();

    if (!$user && ($userIdInput === 'tirth_admin' || $userIdInput === 'admin')) {
        $adminStmt = $pdo->query('SELECT id, name, email, password_hash, role, status FROM users WHERE role = "admin" LIMIT 1');
        $user = $adminStmt->fetch();
    }

    if (!$user) {
        json_response(['success' => false, 'error' => 'Invalid ID/Email or password.'], 401);
    }

    if ($user['status'] !== 'Active') {
        json_response(['success' => false, 'error' => 'Account is inactive. Please contact admin.'], 403);
    }

    if (!password_verify($password, $user['password_hash'])) {
        json_response(['success' => false, 'error' => 'Invalid ID/Email or password.'], 401);
    }

    $token = generate_jwt([
        'id' => $user['id'],
        'email' => $user['email'],
        'name' => $user['name'],
        'role' => $user['role'],
    ]);

    json_response([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'status' => $user['status'],
        ],
    ]);
}

// GET ME
if ($method === 'GET' && $path === '/auth/me') {
    $currentUser = require_auth();
    $stmt = $pdo->prepare('SELECT id, name, email, role, status FROM users WHERE id = ?');
    $stmt->execute([$currentUser['id']]);
    $user = $stmt->fetch();
    if (!$user) {
        json_response(['success' => false, 'error' => 'User not found.'], 404);
    }
    json_response(['success' => true, 'user' => $user]);
}

// UPDATE PROFILE
if ($method === 'PUT' && $path === '/auth/profile') {
    $currentUser = require_auth();
    $input = get_json_input();
    $name = trim($input['name'] ?? '');

    if (!$name) {
        json_response(['success' => false, 'error' => 'Full name is required.'], 400);
    }

    $stmt = $pdo->prepare('UPDATE users SET name = ? WHERE id = ?');
    $stmt->execute([$name, $currentUser['id']]);

    $fetch = $pdo->prepare('SELECT id, name, email, role, status FROM users WHERE id = ?');
    $fetch->execute([$currentUser['id']]);
    $updated = $fetch->fetch();

    json_response(['success' => true, 'message' => 'Profile updated successfully.', 'user' => $updated]);
}

// CHANGE PASSWORD
if ($method === 'POST' && $path === '/auth/change-password') {
    $currentUser = require_auth();
    $input = get_json_input();
    $currentPassword = $input['currentPassword'] ?? '';
    $newPassword = $input['newPassword'] ?? '';

    if (!$currentPassword || !$newPassword) {
        json_response(['success' => false, 'error' => 'Current and new password are required.'], 400);
    }
    if (strlen($newPassword) < 6) {
        json_response(['success' => false, 'error' => 'New password must be at least 6 characters.'], 400);
    }

    $stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = ?');
    $stmt->execute([$currentUser['id']]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
        json_response(['success' => false, 'error' => 'Current password does not match.'], 400);
    }

    $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
    $up = $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
    $up->execute([$newHash, $currentUser['id']]);

    json_response(['success' => true, 'message' => 'Password changed successfully.']);
}

// 3. HEALTH PROFILE ROUTES
if ($path === '/profile') {
    $currentUser = require_auth();

    if ($method === 'GET') {
        $stmt = $pdo->prepare('SELECT * FROM health_profiles WHERE user_id = ?');
        $stmt->execute([$currentUser['id']]);
        $p = $stmt->fetch();

        if (!$p) {
            json_response([
                'success' => true,
                'profile' => [
                    'age' => 26,
                    'gender' => 'male',
                    'height' => 178,
                    'weight' => 71,
                    'activityLevel' => 'moderate',
                    'goal' => 'muscle_gain',
                ],
            ]);
        }

        json_response([
            'success' => true,
            'profile' => [
                'age' => (int) $p['age'],
                'gender' => $p['gender'],
                'height' => (float) $p['height_cm'],
                'weight' => (float) $p['weight_kg'],
                'activityLevel' => $p['activity_level'],
                'goal' => $p['fitness_goal'],
            ],
            'assessmentResults' => [
                'bmi' => (float) $p['bmi'],
                'bmiCategory' => $p['bmi_category'],
                'targetCalories' => (int) $p['target_calories'],
                'targetProtein' => (int) $p['target_protein'],
                'targetCarbs' => (int) $p['target_carbs'],
                'targetFat' => (int) $p['target_fat'],
            ],
        ]);
    }

    if ($method === 'PUT') {
        $input = get_json_input();
        $age = (int) ($input['age'] ?? 26);
        $gender = $input['gender'] ?? 'male';
        $height = (float) ($input['height'] ?? 178);
        $weight = (float) ($input['weight'] ?? 71);
        $activityLevel = $input['activityLevel'] ?? 'moderate';
        $goal = $input['goal'] ?? 'muscle_gain';

        $res = $input['assessmentResults'] ?? [];
        $bmi = $res['bmi'] ?? round($weight / (($height / 100) * ($height / 100)), 1);
        $bmiCat = $res['bmiCategory'] ?? 'Normal';
        $targetCal = $res['targetCalories'] ?? 2250;
        $targetP = $res['targetProtein'] ?? 150;
        $targetC = $res['targetCarbs'] ?? 200;
        $targetF = $res['targetFat'] ?? 65;

        $upsert = $pdo->prepare('
            INSERT INTO health_profiles (
                user_id, age, gender, height_cm, weight_kg, activity_level, fitness_goal,
                target_calories, target_protein, target_carbs, target_fat, bmi, bmi_category
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                age = VALUES(age),
                gender = VALUES(gender),
                height_cm = VALUES(height_cm),
                weight_kg = VALUES(weight_kg),
                activity_level = VALUES(activity_level),
                fitness_goal = VALUES(fitness_goal),
                target_calories = VALUES(target_calories),
                target_protein = VALUES(target_protein),
                target_carbs = VALUES(target_carbs),
                target_fat = VALUES(target_fat),
                bmi = VALUES(bmi),
                bmi_category = VALUES(bmi_category)
        ');
        $upsert->execute([
            $currentUser['id'],
            $age,
            $gender,
            $height,
            $weight,
            $activityLevel,
            $goal,
            $targetCal,
            $targetP,
            $targetC,
            $targetF,
            $bmi,
            $bmiCat
        ]);

        json_response(['success' => true, 'message' => 'Health profile synchronized successfully.']);
    }
}

// ─────────────────────────────────────────────────────────────
// 4. DIET TRACKING ROUTES
// ─────────────────────────────────────────────────────────────
if ($path === '/diet/logs') {
    $currentUser = require_auth();

    if ($method === 'GET') {
        $targetDate = $_GET['date'] ?? date('Y-m-d');
        $stmt = $pdo->prepare('SELECT * FROM meal_logs WHERE user_id = ? AND log_date = ? ORDER BY created_at ASC');
        $stmt->execute([$currentUser['id'], $targetDate]);
        $rows = $stmt->fetchAll();

        $formatted = array_map(function ($r) {
            return [
                'id' => $r['id'],
                'mealType' => $r['meal_type'],
                'meal_type' => $r['meal_type'],
                'food_name' => $r['food_name'],
                'food' => [
                    'id' => $r['id'],
                    'name' => $r['food_name'],
                    'category' => 'Logged Item',
                    'unit' => $r['unit'],
                    'servingSize' => 1,
                ],
                'quantity' => (float) $r['quantity'],
                'unit' => $r['unit'],
                'calories' => (int) $r['calories'],
                'protein' => (float) $r['protein'],
                'protein_g' => (float) $r['protein'],
                'carbs' => (float) $r['carbs'],
                'carbs_g' => (float) $r['carbs'],
                'fat' => (float) $r['fat'],
                'fat_g' => (float) $r['fat'],
                'fiber' => (float) $r['fiber'],
                'timestamp' => $r['log_time'] ?: '12:00 PM',
                'created_at' => $r['created_at'] ?? date('Y-m-d H:i:s'),
            ];
        }, $rows);

        json_response(['success' => true, 'logs' => $formatted, 'meals' => $formatted]);
    }

    if ($method === 'POST') {
        $input = get_json_input();
        $logId = 'log-' . time() . '-' . substr(md5(uniqid()), 0, 5);
        $targetDate = $input['date'] ?? date('Y-m-d');
        $foodName = $input['food']['name'] ?? $input['food_name'] ?? 'Food Item';
        $mealType = strtolower($input['mealType'] ?? 'breakfast');
        $qty = $input['quantity'] ?? 1;
        $unit = $input['unit'] ?? 'serving';
        $cal = $input['calories'] ?? 0;
        $p = $input['protein'] ?? 0;
        $c = $input['carbs'] ?? 0;
        $f = $input['fat'] ?? 0;
        $fiber = $input['fiber'] ?? 0;
        $timeStr = $input['timestamp'] ?? date('h:i A');

        $stmt = $pdo->prepare('
            INSERT INTO meal_logs (id, user_id, log_date, meal_type, food_name, quantity, unit, calories, protein, carbs, fat, fiber, log_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([$logId, $currentUser['id'], $targetDate, $mealType, $foodName, $qty, $unit, $cal, $p, $c, $f, $fiber, $timeStr]);

        json_response([
            'success' => true,
            'log' => [
                'id' => $logId,
                'mealType' => $mealType,
                'food' => ['id' => $logId, 'name' => $foodName, 'unit' => $unit, 'servingSize' => 1],
                'quantity' => (float) $qty,
                'unit' => $unit,
                'calories' => (int) $cal,
                'protein' => (float) $p,
                'carbs' => (float) $c,
                'fat' => (float) $f,
                'fiber' => (float) $fiber,
                'timestamp' => $timeStr,
            ],
        ], 201);
    }
}

if ($method === 'DELETE' && match_route('/diet/logs/:id', $path, $params)) {
    $currentUser = require_auth();
    $stmt = $pdo->prepare('DELETE FROM meal_logs WHERE id = ? AND user_id = ?');
    $stmt->execute([$params['id'], $currentUser['id']]);
    json_response(['success' => true, 'message' => 'Meal log deleted successfully.']);
}

// 5. WORKOUT TRACKING ROUTES
if ($path === '/workout/logs') {
    $currentUser = require_auth();

    if ($method === 'GET') {
        $targetDate = $_GET['date'] ?? date('Y-m-d');
        $stmt = $pdo->prepare('SELECT * FROM workout_logs WHERE user_id = ? AND log_date = ? ORDER BY created_at DESC');
        $stmt->execute([$currentUser['id'], $targetDate]);
        $rows = $stmt->fetchAll();
        json_response(['success' => true, 'workouts' => $rows]);
    }

    if ($method === 'POST') {
        $input = get_json_input();
        $woId = 'wo-' . time();
        $targetDate = $input['date'] ?? date('Y-m-d');
        $title = $input['title'] ?? 'Daily Workout Routine';
        $duration = $input['duration'] ?? 45;
        $burned = $input['caloriesBurned'] ?? 320;
        $notes = $input['notes'] ?? '';

        $stmt = $pdo->prepare('
            INSERT INTO workout_logs (id, user_id, log_date, title, duration_mins, calories_burned, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([$woId, $currentUser['id'], $targetDate, $title, $duration, $burned, $notes]);

        json_response([
            'success' => true,
            'workout' => [
                'id' => $woId,
                'log_date' => $targetDate,
                'title' => $title,
                'duration_mins' => $duration,
                'calories_burned' => $burned,
            ],
        ], 201);
    }
}

// 6. STORE & ORDER ROUTES
// PRODUCTS
if ($method === 'GET' && $path === '/store/products') {
    $stmt = $pdo->query('SELECT * FROM products WHERE status = "Active" ORDER BY sales_count DESC');
    $rows = $stmt->fetchAll();
    $formatted = array_map(function ($p) {
        return [
            'id' => $p['id'],
            'name' => $p['name'],
            'category' => $p['category'],
            'price' => (float) $p['price'],
            'stock' => (int) $p['stock'],
            'description' => $p['description'],
            'image' => $p['image_url'],
            'status' => $p['status'],
            'salesCount' => (int) $p['sales_count'],
        ];
    }, $rows);
    json_response(['success' => true, 'products' => $formatted]);
}

// CHECKOUT
if ($method === 'POST' && $path === '/store/checkout') {
    $currentUser = require_auth();
    if ($currentUser['role'] === 'admin') {
        json_response(['success' => false, 'error' => 'Administrators manage store inventory and cannot place customer orders. Please use a customer account.'], 403);
    }
    $input = get_json_input();
    $orderId = 'ORD-' . substr((string) time(), -6);

    $pdo->beginTransaction();
    try {
        $insOrder = $pdo->prepare('
            INSERT INTO orders (id, user_id, customer_name, customer_email, total_amount, status, shipping_address, phone, payment_method)
            VALUES (?, ?, ?, ?, ?, "Pending", ?, ?, ?)
        ');
        $insOrder->execute([
            $orderId,
            $currentUser['id'],
            $currentUser['name'] ?: 'Valued Customer',
            $currentUser['email'],
            $input['totalAmount'] ?? 0,
            $input['shippingAddress'] ?? '123 Main St',
            $input['phone'] ?? '',
            $input['paymentMethod'] ?? 'Credit Card',
        ]);

        $items = $input['items'] ?? [];
        if (is_array($items)) {
            $insItem = $pdo->prepare('
                INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal)
                VALUES (?, ?, ?, ?, ?, ?)
            ');
            $updStock = $pdo->prepare('
                UPDATE products SET stock = GREATEST(0, stock - ?), sales_count = sales_count + ? WHERE id = ?
            ');

            $chkProduct = $pdo->prepare('SELECT id FROM products WHERE id = ?');

            foreach ($items as $item) {
                $qty = (int) ($item['quantity'] ?? 1);
                $price = (float) ($item['price'] ?? 0);
                $rawId = $item['productId'] ?? $item['id'] ?? null;
                $pId = null;

                if (!empty($rawId)) {
                    $chkProduct->execute([$rawId]);
                    if ($chkProduct->fetch()) {
                        $pId = $rawId;
                    }
                }

                $insItem->execute([$orderId, $pId, $item['name'] ?? '', $price, $qty, $price * $qty]);

                if (!empty($pId)) {
                    $updStock->execute([$qty, $qty, $pId]);
                }
            }
        }

        $pdo->commit();
        json_response(['success' => true, 'message' => 'Order placed successfully!', 'orderId' => $orderId], 201);
    } catch (Exception $e) {
        $pdo->rollBack();
        json_response(['success' => false, 'error' => 'Checkout failed: ' . $e->getMessage()], 500);
    }
}

// USER ORDERS
if ($method === 'GET' && $path === '/store/orders') {
    $currentUser = require_auth();
    $stmt = $pdo->prepare('
        SELECT id, total_amount, status, shipping_address, payment_method, created_at
        FROM orders
        WHERE user_id = ? OR customer_email = ?
        ORDER BY created_at DESC
    ');
    $stmt->execute([$currentUser['id'], $currentUser['email']]);
    $orders = $stmt->fetchAll();

    if (empty($orders)) {
        json_response(['success' => true, 'orders' => []]);
    }

    $orderIds = array_column($orders, 'id');
    $inClause = implode(',', array_fill(0, count($orderIds), '?'));
    $itemsStmt = $pdo->prepare("SELECT order_id, product_name, price, quantity, subtotal FROM order_items WHERE order_id IN ($inClause)");
    $itemsStmt->execute($orderIds);
    $items = $itemsStmt->fetchAll();

    $itemsByOrder = [];
    foreach ($items as $it) {
        $itemsByOrder[$it['order_id']][] = [
            'name' => $it['product_name'],
            'price' => (float) $it['price'],
            'qty' => (int) $it['quantity'],
            'total' => (float) $it['subtotal'],
        ];
    }

    $formatted = array_map(function ($o) use ($itemsByOrder) {
        return [
            'id' => $o['id'],
            'orderNumber' => $o['id'],
            'date' => date('M j, Y', strtotime($o['created_at'])),
            'createdAt' => $o['created_at'],
            'status' => $o['status'],
            'totalAmount' => (float) $o['total_amount'],
            'total' => (float) $o['total_amount'],
            'paymentMethod' => $o['payment_method'],
            'shippingAddress' => $o['shipping_address'],
            'items' => $itemsByOrder[$o['id']] ?? [],
        ];
    }, $orders);

    json_response(['success' => true, 'orders' => $formatted]);
}

// 7. ADMIN PORTAL ROUTES

if (strpos($path, '/admin') === 0) {
    require_admin();

    // STATS
    if ($method === 'GET' && $path === '/admin/stats') {
        $uCount = $pdo->query('SELECT COUNT(*) as count FROM users')->fetch()['count'] ?? 0;
        $actU = $pdo->query('SELECT COUNT(*) as count FROM users WHERE status = "Active"')->fetch()['count'] ?? 0;
        $pCount = $pdo->query('SELECT COUNT(*) as count FROM products')->fetch()['count'] ?? 0;
        $actP = $pdo->query('SELECT COUNT(*) as count FROM products WHERE status = "Active"')->fetch()['count'] ?? 0;
        $lowStock = $pdo->query('SELECT COUNT(*) as count FROM products WHERE stock <= 10')->fetch()['count'] ?? 0;
        $oCount = $pdo->query('SELECT COUNT(*) as count FROM orders')->fetch()['count'] ?? 0;
        $pendingO = $pdo->query('SELECT COUNT(*) as count FROM orders WHERE status IN ("Pending", "Processing")')->fetch()['count'] ?? 0;
        $rev = $pdo->query('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != "Cancelled"')->fetch()['total'] ?? 0;

        json_response([
            'success' => true,
            'stats' => [
                'totalUsers' => (int) $uCount,
                'activeUsersCount' => (int) $actU,
                'totalProducts' => (int) $pCount,
                'activeProductsCount' => (int) $actP,
                'lowStockCount' => (int) $lowStock,
                'totalOrders' => (int) $oCount,
                'pendingOrdersCount' => (int) $pendingO,
                'totalRevenue' => (float) $rev,
                'monthlyRevenue' => (float) $rev,
            ],
        ]);
    }

    // USERS
    if ($method === 'GET' && $path === '/admin/users') {
        $stmt = $pdo->query('
            SELECT u.id, u.name, u.email, u.role, u.status, u.created_at,
                   COUNT(o.id) as ordersCount,
                   COALESCE(SUM(o.total_amount), 0) as spentTotal
            FROM users u
            LEFT JOIN orders o ON (o.user_id = u.id OR o.customer_email = u.email) AND o.status != "Cancelled"
            GROUP BY u.id, u.name, u.email, u.role, u.status, u.created_at
            ORDER BY u.created_at DESC
        ');
        $rows = $stmt->fetchAll();
        $formatted = array_map(function ($u) {
            return [
                'id' => $u['id'],
                'name' => $u['name'],
                'email' => $u['email'],
                'role' => $u['role'],
                'status' => $u['status'],
                'ordersCount' => (int) $u['ordersCount'],
                'spentTotal' => (float) $u['spentTotal'],
                'joinDate' => date('M j, Y', strtotime($u['created_at'])),
                'created_at' => $u['created_at'],
            ];
        }, $rows);
        json_response(['success' => true, 'users' => $formatted]);
    }
    if ($method === 'PUT' && match_route('/admin/users/:id', $path, $params)) {
        $input = get_json_input();
        $stmt = $pdo->prepare('UPDATE users SET role = COALESCE(?, role), status = COALESCE(?, status) WHERE id = ?');
        $stmt->execute([$input['role'] ?? null, $input['status'] ?? null, $params['id']]);
        json_response(['success' => true, 'message' => 'User updated successfully.']);
    }
    if ($method === 'DELETE' && match_route('/admin/users/:id', $path, $params)) {
        $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
        $stmt->execute([$params['id']]);
        json_response(['success' => true, 'message' => 'User deleted successfully.']);
    }

    // PRODUCTS
    if ($method === 'GET' && $path === '/admin/products') {
        $stmt = $pdo->query('SELECT * FROM products ORDER BY created_at DESC');
        $rows = $stmt->fetchAll();
        $formatted = array_map(function ($p) {
            return [
                'id' => $p['id'],
                'name' => $p['name'],
                'category' => $p['category'],
                'price' => (float) $p['price'],
                'stock' => (int) $p['stock'],
                'description' => $p['description'],
                'image' => $p['image_url'],
                'image_url' => $p['image_url'],
                'status' => $p['status'],
                'salesCount' => (int) $p['sales_count'],
            ];
        }, $rows);
        json_response(['success' => true, 'products' => $formatted]);
    }
    if ($method === 'POST' && $path === '/admin/products') {
        $input = get_json_input();
        $pId = 'PRD-' . rand(100, 999);
        $stmt = $pdo->prepare('INSERT INTO products (id, name, category, price, stock, description, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $pId,
            $input['name'] ?? '',
            $input['category'] ?? 'General',
            $input['price'] ?? 0,
            $input['stock'] ?? 0,
            $input['description'] ?? '',
            $input['image_url'] ?? $input['image'] ?? '',
        ]);
        $newProduct = [
            'id' => $pId,
            'name' => $input['name'] ?? '',
            'category' => $input['category'] ?? 'General',
            'price' => (float) ($input['price'] ?? 0),
            'stock' => (int) ($input['stock'] ?? 0),
            'description' => $input['description'] ?? '',
            'image' => $input['image_url'] ?? $input['image'] ?? '',
            'image_url' => $input['image_url'] ?? $input['image'] ?? '',
            'status' => $input['status'] ?? 'Active',
            'salesCount' => 0,
        ];
        json_response(['success' => true, 'message' => 'Product created.', 'productId' => $pId, 'product' => $newProduct], 201);
    }
    if ($method === 'PUT' && match_route('/admin/products/:id', $path, $params)) {
        $input = get_json_input();
        $stmt = $pdo->prepare('UPDATE products SET name = ?, category = ?, price = ?, stock = ?, status = ? WHERE id = ?');
        $stmt->execute([$input['name'], $input['category'], $input['price'], $input['stock'], $input['status'] ?? 'Active', $params['id']]);
        json_response(['success' => true, 'message' => 'Product updated.']);
    }
    if ($method === 'DELETE' && match_route('/admin/products/:id', $path, $params)) {
        $stmt = $pdo->prepare('DELETE FROM products WHERE id = ?');
        $stmt->execute([$params['id']]);
        json_response(['success' => true, 'message' => 'Product deleted.']);
    }

    // ORDERS
    if ($method === 'GET' && $path === '/admin/orders') {
        $stmt = $pdo->query('SELECT * FROM orders ORDER BY created_at DESC');
        $orders = $stmt->fetchAll();

        $orderIds = array_column($orders, 'id');
        $itemsByOrder = [];
        if (!empty($orderIds)) {
            $inClause = implode(',', array_fill(0, count($orderIds), '?'));
            $itemsStmt = $pdo->prepare("SELECT order_id, product_name, price, quantity, subtotal FROM order_items WHERE order_id IN ($inClause)");
            $itemsStmt->execute($orderIds);
            $items = $itemsStmt->fetchAll();
            foreach ($items as $it) {
                $itemsByOrder[$it['order_id']][] = [
                    'name' => $it['product_name'],
                    'price' => (float) $it['price'],
                    'quantity' => (int) $it['quantity'],
                    'subtotal' => (float) $it['subtotal'],
                ];
            }
        }

        $formatted = array_map(function ($o) use ($itemsByOrder) {
            $ordItems = $itemsByOrder[$o['id']] ?? [];
            return [
                'id' => $o['id'],
                'customer' => [
                    'name' => $o['customer_name'] ?: 'Customer',
                    'email' => $o['customer_email'] ?: 'No email',
                    'phone' => $o['phone'] ?: '',
                ],
                'customer_name' => $o['customer_name'],
                'customer_email' => $o['customer_email'],
                'date' => date('M j, Y', strtotime($o['created_at'])),
                'created_at' => $o['created_at'],
                'items' => $ordItems,
                'itemCount' => count($ordItems),
                'total' => (float) $o['total_amount'],
                'total_amount' => (float) $o['total_amount'],
                'status' => $o['status'],
                'paymentMethod' => $o['payment_method'],
                'shippingAddress' => $o['shipping_address'],
            ];
        }, $orders);

        json_response(['success' => true, 'orders' => $formatted]);
    }
    if ($method === 'PUT' && (match_route('/admin/orders/:id', $path, $params) || match_route('/admin/orders/:id/status', $path, $params))) {
        $input = get_json_input();
        $stmt = $pdo->prepare('UPDATE orders SET status = ? WHERE id = ?');
        $stmt->execute([$input['status'] ?? 'Processing', $params['id']]);
        json_response(['success' => true, 'message' => 'Order status updated.']);
    }
}

// 404 FALLTHROUGH
json_response(['success' => false, 'error' => "Endpoint not found: $method $path"], 404);
