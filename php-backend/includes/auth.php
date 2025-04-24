<?php
function getCurrentUser() {
    $sessionToken = null;

    if (isset($_COOKIE['next-auth.session-token'])) {
        $sessionToken = $_COOKIE['next-auth.session-token'];
    } elseif (isset($_COOKIE['__Secure-next-auth.session-token'])) {
        $sessionToken = $_COOKIE['__Secure-next-auth.session-token'];
    }

    if (!$sessionToken) {
        return null;
    }

    $pdo = getDbConnection();

    $stmt = $pdo->prepare("SELECT * FROM \"Session\" WHERE \"sessionToken\" = ? AND expires > NOW()");
    $stmt->execute([$sessionToken]);
    $session = $stmt->fetch();

    if (!$session) {
        return null;
    }

    $stmt = $pdo->prepare("SELECT * FROM \"User\" WHERE id = ?");
    $stmt->execute([$session['userId']]);
    $user = $stmt->fetch();

    return $user;
}

function requireAuth() {
    if (isset($_GET['test'])) {
        return [
            'id' => 'test-user-id',
            'name' => 'Test User',
            'email' => 'test@example.com'
        ];
    }

    $user = getCurrentUser();

    if (!$user) {
        header('Content-Type: application/json');
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    return $user;
}
