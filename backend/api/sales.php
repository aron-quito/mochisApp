<?php
require 'db.php';
$currentUser = checkAuth();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM sales ORDER BY timestamp DESC");
    $sales = $stmt->fetchAll();
    foreach ($sales as &$s) {
        $s['quantity']   = (int)$s['quantity'];
        $s['unitPrice']  = (float)$s['unitPrice'];
        $s['totalPrice'] = (float)$s['totalPrice'];
    }
    echo json_encode($sales);

} elseif ($method === 'POST') {
    $input = getJsonInput();
    $id            = uniqid();
    $product_id    = $input['productId'] ?? '';
    $lot_id        = $input['lotId'] ?? null;
    $sku           = $input['sku'] ?? '';
    $productName   = $input['productName'] ?? '';
    $quantity      = (int)($input['quantity'] ?? 0);
    $unitPrice     = (float)($input['unitPrice'] ?? 0);
    $totalPrice    = (float)($input['totalPrice'] ?? 0);
    $paymentMethod = $input['paymentMethod'] ?? '';
    $location      = $input['location'] ?? '';

    // Who made the sale
    $employeeId   = $currentUser['id'];
    $employeeName = $currentUser['name'];

    try {
        $pdo->beginTransaction();

        $pdo->prepare("INSERT INTO sales (id, product_id, lot_id, sku, productName, quantity, unitPrice, totalPrice, paymentMethod, location, employee_id, employee_name) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")
            ->execute([$id, $product_id, $lot_id, $sku, $productName, $quantity, $unitPrice, $totalPrice, $paymentMethod, $location, $employeeId, $employeeName]);

        // Reduce stock FIFO if no specific lot given
        if ($lot_id) {
            $pdo->prepare("UPDATE lots SET remainingStock = remainingStock - ? WHERE id = ?")
                ->execute([$quantity, $lot_id]);
        } else {
            $remaining = $quantity;
            $lots = $pdo->prepare("SELECT id, remainingStock FROM lots WHERE product_id = ? AND remainingStock > 0 ORDER BY importDate ASC");
            $lots->execute([$product_id]);
            foreach ($lots->fetchAll() as $lot) {
                if ($remaining <= 0) break;
                $deduct = min($remaining, $lot['remainingStock']);
                $pdo->prepare("UPDATE lots SET remainingStock = remainingStock - ? WHERE id = ?")
                    ->execute([$deduct, $lot['id']]);
                $remaining -= $deduct;
            }
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
