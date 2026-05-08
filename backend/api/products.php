<?php
require 'db.php';
checkAuth();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Get all products with their lots
    $stmt = $pdo->query("SELECT * FROM products ORDER BY createdAt DESC");
    $products = $stmt->fetchAll();
    
    foreach ($products as &$p) {
        $p['sizes'] = json_decode($p['sizes'], true) ?: [];
        $p['sellingPrice'] = (float)$p['sellingPrice'];
        
        // Get lots for this product
        $lotStmt = $pdo->prepare("SELECT * FROM lots WHERE product_id = ?");
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
    $id = uniqid();
    $sku = $input['sku'] ?? '';
    $name = $input['name'] ?? '';
    $brand = $input['brand'] ?? '';
    $category = $input['category'] ?? '';
    $sizes = json_encode($input['sizes'] ?? []);
    $material = $input['material'] ?? '';
    $sellingPrice = $input['sellingPrice'] ?? 0;
    $imageUrl = $input['imageUrl'] ?? '';
    $location = $input['location'] ?? '';

    $stmt = $pdo->prepare("INSERT INTO products (id, sku, name, brand, category, sizes, material, sellingPrice, imageUrl, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id, $sku, $name, $brand, $category, $sizes, $material, $sellingPrice, $imageUrl, $location]);

    // Handle initial lots if any
    if (isset($input['lots']) && is_array($input['lots'])) {
        foreach ($input['lots'] as $lot) {
            $lotId = uniqid();
            $qty = $lot['quantity'] ?? 0;
            $rem = $lot['remainingStock'] ?? $qty;
            $cost = $lot['totalCost'] ?? 0;
            $lotStmt = $pdo->prepare("INSERT INTO lots (id, product_id, quantity, remainingStock, totalCost) VALUES (?, ?, ?, ?, ?)");
            $lotStmt->execute([$lotId, $id, $qty, $rem, $cost]);
        }
    }

    echo json_encode(['id' => $id]);

} elseif ($method === 'PUT') {
    // Update existing product
    $input = getJsonInput();
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing ID']);
        exit;
    }

    $sku = $input['sku'] ?? '';
    $name = $input['name'] ?? '';
    $brand = $input['brand'] ?? '';
    $category = $input['category'] ?? '';
    $sizes = json_encode($input['sizes'] ?? []);
    $material = $input['material'] ?? '';
    $sellingPrice = $input['sellingPrice'] ?? 0;
    $imageUrl = $input['imageUrl'] ?? '';
    $location = $input['location'] ?? '';

    $stmt = $pdo->prepare("UPDATE products SET sku=?, name=?, brand=?, category=?, sizes=?, material=?, sellingPrice=?, imageUrl=?, location=? WHERE id=?");
    $stmt->execute([$sku, $name, $brand, $category, $sizes, $material, $sellingPrice, $imageUrl, $location, $id]);

    if (isset($input['lots']) && is_array($input['lots'])) {
        foreach ($input['lots'] as $lot) {
            // Check if lot exists
            $lotId = $lot['id'] ?? uniqid();
            $checkStmt = $pdo->prepare("SELECT id FROM lots WHERE id = ?");
            $checkStmt->execute([$lotId]);
            if (!$checkStmt->fetch()) {
                $qty = $lot['quantity'] ?? 0;
                $rem = $lot['remainingStock'] ?? $qty;
                $cost = $lot['totalCost'] ?? 0;
                $lotStmt = $pdo->prepare("INSERT INTO lots (id, product_id, quantity, remainingStock, totalCost) VALUES (?, ?, ?, ?, ?)");
                $lotStmt->execute([$lotId, $id, $qty, $rem, $cost]);
            } else {
                // Optionally update remaining stock if needed
                $rem = $lot['remainingStock'] ?? 0;
                $updStmt = $pdo->prepare("UPDATE lots SET remainingStock = ? WHERE id = ?");
                $updStmt->execute([$rem, $lotId]);
            }
        }
    }

    echo json_encode(['success' => true]);

} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing ID']);
        exit;
    }
    
    $stmt = $pdo->prepare("DELETE FROM products WHERE id=?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
}
?>
