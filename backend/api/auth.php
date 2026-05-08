<?php
require 'db.php';

$input = getJsonInput();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Login: try admin first, then employee
    $usernameOrEmail = $input['username'] ?? $input['email'] ?? '';
    $password = $input['password'] ?? '';

    if (!$usernameOrEmail || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Credentials required']);
        exit;
    }

    // Admin check
    $stmt = $pdo->prepare('SELECT * FROM admins WHERE username = ?');
    $stmt->execute([$usernameOrEmail]);
    $admin = $stmt->fetch();

    if ($admin && password_verify($password, $admin['password_hash'])) {
        echo json_encode([
            'token' => 'admin-token-123',
            'role'  => 'admin',
            'user'  => ['username' => $admin['username'], 'name' => 'Admin', 'id' => null]
        ]);
        exit;
    }

    // Employee check
    $stmt = $pdo->prepare('SELECT * FROM employees WHERE email = ? AND active = 1');
    $stmt->execute([$usernameOrEmail]);
    $emp = $stmt->fetch();

    if ($emp && password_verify($password, $emp['password_hash'])) {
        $token = bin2hex(random_bytes(32));
        $pdo->prepare("UPDATE employees SET session_token = ? WHERE id = ?")->execute([$token, $emp['id']]);
        echo json_encode([
            'token' => $token,
            'role'  => 'employee',
            'user'  => [
                'id'    => $emp['id'],
                'name'  => $emp['firstName'] . ' ' . $emp['lastName'],
                'email' => $emp['email']
            ]
        ]);
        exit;
    }

    http_response_code(401);
    echo json_encode(['error' => 'Credenciales incorrectas']);
}
?>
