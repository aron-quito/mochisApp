<?php
require 'db.php';
checkAuth();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch all logs ordered by newest first
    $stmt = $pdo->query("SELECT * FROM product_logs ORDER BY created_at DESC LIMIT 500");
    $logs = $stmt->fetchAll();
    foreach ($logs as &$log) {
        $log['quantity_delta'] = (int)$log['quantity_delta'];
        $log['old_data'] = $log['old_data'] ? json_decode($log['old_data'], true) : null;
        $log['new_data'] = $log['new_data'] ? json_decode($log['new_data'], true) : null;
    }
    echo json_encode($logs);
}
?>
