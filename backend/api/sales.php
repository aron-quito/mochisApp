<?php
require 'db.php';
checkAuth();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM sales ORDER BY timestamp DESC");
    $sales = $stmt->fetchAll();
    foreach ($sales as &$s) {
        $s['quantity'] = (int)$s['quantity'];
        $s['unitPrice'] = (float)$s['unitPrice'];
        $s['totalPrice'] = (float)$s['totalPrice'];
    }
    echo json_encode($sales);

} elseif ($method === 'POST') {
    $input = getJsonInput();
    $id = uniqid();
    $product_id = $input['productId'] ?? '';
    $lot_id = $input['lotId'] ?? null;
    $sku = $input['sku'] ?? '';
    $productName = $input['productName'] ?? '';
    $quantity = $input['quantity'] ?? 0;
    $unitPrice = $input['unitPrice'] ?? 0;
    $totalPrice = $input['totalPrice'] ?? 0;
    $paymentMethod = $input['paymentMethod'] ?? '';
    $location = $input['location'] ?? '';

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("INSERT INTO sales (id, product_id, lot_id, sku, productName, quantity, unitPrice, totalPrice, paymentMethod, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $product_id, $lot_id, $sku, $productName, $quantity, $unitPrice, $totalPrice, $paymentMethod, $location]);

        // Reduce stock from lot if provided
        if ($lot_id) {
            $updLot = $pdo->prepare("UPDATE lots SET remainingStock = remainingStock - ? WHERE id = ?");
            $updLot->execute([$quantity, $lot_id]);
        }

        $pdo->commit();
        echo json_encode(['id' => $id]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
