<?php
require 'db.php';
$user = checkAuth();
if ($user['role'] !== 'admin') { http_response_code(403); echo json_encode(['error'=>'Admin only']); exit; }

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT id,firstName,lastName,dni,birthDate,address,email,active,createdAt FROM employees ORDER BY createdAt DESC");
    echo json_encode($stmt->fetchAll());

} elseif ($method === 'POST') {
    $input = getJsonInput();
    $email = trim($input['email'] ?? '');
    $dni   = trim($input['dni'] ?? '');

    // Duplicate check
    $check = $pdo->prepare("SELECT id FROM employees WHERE email=? OR dni=?");
    $check->execute([$email, $dni]);
    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Ya existe un empleado con ese email o DNI']);
        exit;
    }

    $id   = uniqid('emp_');
    $hash = password_hash($input['password'] ?? 'changeme123', PASSWORD_BCRYPT);

    $birthDate = !empty($input['birthDate']) ? $input['birthDate'] : null;
    $address   = !empty($input['address']) ? $input['address'] : '';

    try {
        $pdo->prepare("INSERT INTO employees (id,firstName,lastName,dni,birthDate,address,email,password_hash) VALUES (?,?,?,?,?,?,?,?)")
            ->execute([$id, $input['firstName']??'', $input['lastName']??'', $dni,
                       $birthDate, $address, $email, $hash]);
        echo json_encode(['id' => $id]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error de base de datos: ' . $e->getMessage()]);
        exit;
    }

} elseif ($method === 'PUT') {
    $id    = $_GET['id'] ?? null;
    $input = getJsonInput();
    if (!$id) { http_response_code(400); echo json_encode(['error'=>'Missing ID']); exit; }

    $fields = ['firstName','lastName','address','birthDate','active'];
    $sets   = []; $vals = [];
    foreach ($fields as $f) {
        if (isset($input[$f])) { $sets[] = "$f=?"; $vals[] = $input[$f]; }
    }
    if (isset($input['password']) && $input['password']) {
        $sets[] = "password_hash=?";
        $vals[] = password_hash($input['password'], PASSWORD_BCRYPT);
    }
    if ($sets) {
        $vals[] = $id;
        $pdo->prepare("UPDATE employees SET ".implode(',',$sets)." WHERE id=?")->execute($vals);
    }
    echo json_encode(['success'=>true]);

} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(['error'=>'Missing ID']); exit; }
    $pdo->prepare("UPDATE employees SET active=0 WHERE id=?")->execute([$id]);
    echo json_encode(['success'=>true]);
}
?>
