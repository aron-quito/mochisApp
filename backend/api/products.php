<?php
require 'db.php';
checkAuth();

$method = $_SERVER['REQUEST_METHOD'];

// Helper: insert a log entry
function insertLog($pdo, $productId, $productName, $eventType, $quantityDelta, $notes, $oldData = null, $newData = null) {
    $logId = uniqid();
    $oldJson = $oldData ? json_encode($oldData) : null;
    $newJson = $newData ? json_encode($newData) : null;
    $stmt = $pdo->prepare("INSERT INTO product_logs (id, product_id, product_name, event_type, quantity_delta, notes, old_data, new_data) VALUES (?,?,?,?,?,?,?,?)");
    $stmt->execute([$logId, $productId, $productName, $eventType, $quantityDelta, $notes, $oldJson, $newJson]);
}

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM products ORDER BY createdAt DESC");
    $products = $stmt->fetchAll();

    foreach ($products as &$p) {
        $p['sizes'] = json_decode($p['sizes'], true) ?: [];
        $p['sellingPrice'] = (float)$p['sellingPrice'];

        $lotStmt = $pdo->prepare("SELECT * FROM lots WHERE product_id = ? ORDER BY importDate ASC");
        $lotStmt->execute([$p['id']]);
        $lots = $lotStmt->fetchAll();

        $totalStock = 0;
        foreach ($lots as &$lot) {
            $lot['quantity'] = (int)$lot['quantity'];
            $lot['remainingStock'] = (int)$lot['remainingStock'];
            $lot['totalCost'] = (float)$lot['totalCost'];
            $lot['unitCost'] = $lot['quantity'] > 0 ? $lot['totalCost'] / $lot['quantity'] : 0;
            $totalStock += $lot['remainingStock'];
        }
        $p['lots'] = $lots;
        $p['totalStock'] = $totalStock;
    }
    echo json_encode($products);

} elseif ($method === 'POST') {
    $input = getJsonInput();
    $action = $input['action'] ?? 'create';

    // --- Stock Withdrawal ---
    if ($action === 'withdraw') {
        $productId = $input['productId'] ?? null;
        $amount    = (int)($input['amount'] ?? 0);
        $reason    = $input['reason'] ?? 'Retiro manual';

        if (!$productId || $amount <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid withdrawal data']);
            exit;
        }

        // Get product
        $pStmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
        $pStmt->execute([$productId]);
        $product = $pStmt->fetch();
        if (!$product) { http_response_code(404); echo json_encode(['error' => 'Product not found']); exit; }

        // Deduct from lots (FIFO)
        $lotStmt = $pdo->prepare("SELECT * FROM lots WHERE product_id = ? AND remainingStock > 0 ORDER BY importDate ASC");
        $lotStmt->execute([$productId]);
        $lots = $lotStmt->fetchAll();

        $remaining = $amount;
        foreach ($lots as $lot) {
            if ($remaining <= 0) break;
            $deduct = min($remaining, $lot['remainingStock']);
            $newRem = $lot['remainingStock'] - $deduct;
            $pdo->prepare("UPDATE lots SET remainingStock = ? WHERE id = ?")->execute([$newRem, $lot['id']]);
            $remaining -= $deduct;
        }

        if ($remaining > 0) {
            http_response_code(422);
            echo json_encode(['error' => 'Not enough stock to withdraw']);
            exit;
        }

        insertLog($pdo, $productId, $product['name'], 'stock_withdrawal', -$amount, $reason);
        echo json_encode(['success' => true]);

    // --- Create new product ---
    } else {
        $id           = uniqid();
        $sku          = $input['sku'] ?? '';
        $name         = $input['name'] ?? '';
        $brand        = $input['brand'] ?? '';
        $category     = $input['category'] ?? '';
        $sizes        = json_encode($input['sizes'] ?? []);
        $material     = $input['material'] ?? '';
        $sellingPrice = $input['sellingPrice'] ?? 0;
        $imageUrl     = $input['imageUrl'] ?? '';
        $location     = $input['location'] ?? '';

        $stmt = $pdo->prepare("INSERT INTO products (id, sku, name, brand, category, sizes, material, sellingPrice, imageUrl, location) VALUES (?,?,?,?,?,?,?,?,?,?)");
        $stmt->execute([$id, $sku, $name, $brand, $category, $sizes, $material, $sellingPrice, $imageUrl, $location]);

        if (isset($input['lots']) && is_array($input['lots'])) {
            foreach ($input['lots'] as $lot) {
                $lotId = uniqid();
                $qty   = $lot['quantity'] ?? 0;
                $rem   = $lot['remainingStock'] ?? $qty;
                $cost  = $lot['totalCost'] ?? 0;
                $pdo->prepare("INSERT INTO lots (id, product_id, quantity, remainingStock, totalCost) VALUES (?,?,?,?,?)")
                    ->execute([$lotId, $id, $qty, $rem, $cost]);

                // Log the import
                insertLog($pdo, $id, $name, 'import', $qty,
                    "Importación inicial: {$qty} unidades a \${$cost} costo total",
                    null,
                    ['quantity' => $qty, 'totalCost' => $cost, 'sellingPrice' => $sellingPrice]
                );
            }
        }
        echo json_encode(['id' => $id]);
    }

} elseif ($method === 'PUT') {
    $input = getJsonInput();
    $id    = $_GET['id'] ?? null;
    $action = $_GET['action'] ?? 'update';

    if (!$id) { http_response_code(400); echo json_encode(['error' => 'Missing ID']); exit; }

    // --- Add new lot to existing product ---
    if ($action === 'add_lot') {
        $lot   = $input['lot'] ?? [];
        $lotId = uniqid();
        $qty   = $lot['quantity'] ?? 0;
        $rem   = $lot['remainingStock'] ?? $qty;
        $cost  = $lot['totalCost'] ?? 0;

        // Get current product for name
        $pStmt = $pdo->prepare("SELECT name, sellingPrice FROM products WHERE id = ?");
        $pStmt->execute([$id]);
        $product = $pStmt->fetch();

        $pdo->prepare("INSERT INTO lots (id, product_id, quantity, remainingStock, totalCost) VALUES (?,?,?,?,?)")
            ->execute([$lotId, $id, $qty, $rem, $cost]);

        insertLog($pdo, $id, $product['name'], 'import', $qty,
            "Nueva importación: {$qty} unidades a \${$cost} costo total",
            null,
            ['lotId' => $lotId, 'quantity' => $qty, 'totalCost' => $cost, 'sellingPrice' => $product['sellingPrice']]
        );
        echo json_encode(['success' => true, 'lotId' => $lotId]);

    // --- Update product fields ---
    } else {
        // Fetch old data for diff
        $oldStmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
        $oldStmt->execute([$id]);
        $old = $oldStmt->fetch();

        $sku          = $input['sku'] ?? $old['sku'];
        $name         = $input['name'] ?? $old['name'];
        $brand        = $input['brand'] ?? $old['brand'];
        $category     = $input['category'] ?? $old['category'];
        $sizes        = json_encode($input['sizes'] ?? json_decode($old['sizes'], true) ?? []);
        $material     = $input['material'] ?? $old['material'];
        $sellingPrice = $input['sellingPrice'] ?? $old['sellingPrice'];
        $imageUrl     = $input['imageUrl'] ?? $old['imageUrl'];
        $location     = $input['location'] ?? $old['location'];

        $pdo->prepare("UPDATE products SET sku=?,name=?,brand=?,category=?,sizes=?,material=?,sellingPrice=?,imageUrl=?,location=? WHERE id=?")
            ->execute([$sku, $name, $brand, $category, $sizes, $material, $sellingPrice, $imageUrl, $location, $id]);

        // Build diff for log — normalize types before comparing
        $watchFields = ['name','brand','category','material','sellingPrice','sku'];
        $oldData = [];
        $newData = [];
        foreach ($watchFields as $f) {
            $oldVal = $old[$f] ?? '';
            if ($f === 'sellingPrice') {
                $oldNorm = (float)$oldVal;
                $newNorm = (float)$sellingPrice;
                if ($oldNorm !== $newNorm) {
                    $oldData[$f] = $oldNorm;
                    $newData[$f] = $newNorm;
                }
            } else {
                $newVal = $$f;
                $oldTrim = trim((string)$oldVal);
                $newTrim = trim((string)$newVal);
                if ($oldTrim !== $newTrim && !($oldTrim === '' && $newTrim === '')) {
                    $oldData[$f] = $oldVal;
                    $newData[$f] = $newVal;
                }
            }
        }

        if (!empty($oldData)) {
            $notes = "Campos editados: " . implode(', ', array_keys($oldData));
            insertLog($pdo, $id, $name, 'product_edit', 0, $notes, $oldData, $newData);
        }

        echo json_encode(['success' => true]);
    }

} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'Missing ID']); exit; }
    $pdo->prepare("DELETE FROM products WHERE id=?")->execute([$id]);
    echo json_encode(['success' => true]);
}
?>
