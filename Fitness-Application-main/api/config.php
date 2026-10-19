<?php
// MacroPace Database Configuration & Core Helpers for XAMPP
error_reporting(E_ALL);
ini_set('display_errors', '0');

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$db_host = 'localhost';
$db_name = 'macropace_db';
$db_user = 'root';
$db_pass = '';

try {
    $pdo = new PDO("mysql:host={$db_host};dbname={$db_name};charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    json_response(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()], 500);
}

function json_response($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

function get_json_input() {
    $raw = file_get_contents('php://input');
    if ($raw) {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            return $decoded;
        }
    }
    return !empty($_POST) ? $_POST : [];
}

const JWT_SECRET = 'macropace_secret';

function generate_jwt($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $payload['exp'] = time() + (7 * 24 * 60 * 60);
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}

function verify_jwt($token) {
    if (!$token) return null;
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    list($header64, $payload64, $sig64) = $parts;
    $expectedSig = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(hash_hmac('sha256', "$header64.$payload64", JWT_SECRET, true)));
    if (!hash_equals($expectedSig, $sig64)) return null;
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload64)), true);
    if (isset($payload['exp']) && $payload['exp'] < time()) return null;
    return $payload;
}

function get_auth_user() {
    $headers = getallheaders();
    $authHeader = '';
    foreach ($headers as $key => $val) {
        if (strtolower($key) === 'authorization') {
            $authHeader = $val;
            break;
        }
    }
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return verify_jwt(trim($matches[1]));
    }
    return null;
}

function require_auth() {
    $user = get_auth_user();
    if (!$user) {
        json_response(['success' => false, 'error' => 'Authentication required.'], 401);
    }
    return $user;
}

function require_admin() {
    $user = require_auth();
    if (($user['role'] ?? '') !== 'admin') {
        json_response(['success' => false, 'error' => 'Access denied. Administrator privileges required.'], 403);
    }
    return $user;
}
