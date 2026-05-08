<?php

// Get bearer token from request
function getBearerToken() {
    $authHeader = null;
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
    }
    if ($authHeader && preg_match('/Bearer\s+(.+)$/i', $authHeader, $m)) {
        return $m[1];
    }
    return null;
}

// Returns ['role'=>'admin'|'employee', 'id'=>..., 'name'=>...] or dies with 401
function checkAuth() {
    global $pdo;
    $token = getBearerToken();

    // Admin static token
    if ($token === 'admin-token-123') {
        return ['role' => 'admin', 'id' => null, 'name' => 'Admin'];
    }

    // Check employee session token
    if ($token) {
        $stmt = $pdo->prepare("SELECT id, firstName, lastName FROM employees WHERE session_token = ? AND active = 1");
        $stmt->execute([$token]);
        $emp = $stmt->fetch();
        if ($emp) {
            return ['role' => 'employee', 'id' => $emp['id'], 'name' => $emp['firstName'] . ' ' . $emp['lastName']];
        }
    }

    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

// Helper to get JSON input
function getJsonInput() {
    return json_decode(file_get_contents("php://input"), true);
}

// DB connection
$host = getenv('DB_HOST') ?: 'db';
$db   = getenv('DB_NAME') ?: 'clothstock';
$user = getenv('DB_USER') ?: 'clothuser';
$pass = getenv('DB_PASS') ?: 'clothpassword';

$dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];
try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    echo json_encode(["error" => "Database connection failed"]);
    http_response_code(500);
    exit();
}

// CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
?>
