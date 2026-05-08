<?php
require 'db.php';

$input = getJsonInput();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($input['username']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Username and password required']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT * FROM admins WHERE username = ?');
    $stmt->execute([$input['username']]);
    $admin = $stmt->fetch();

    if ($admin && password_verify($input['password'], $admin['password_hash'])) {
        // Return a simple static token for this prototype
        echo json_encode([
            'token' => 'admin-token-123',
            'user' => [
                'username' => $admin['username'],
                'id' => $admin['id']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
}
?>
