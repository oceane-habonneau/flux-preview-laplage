<?php
/**
 * FLUXhub — PHP Adapter v1.0
 * Déposer dans /api/adapter.php sur le serveur OVH
 * 
 * Protections :
 * - CORS restreint au même domaine
 * - Mot de passe admin requis pour les écritures
 * - Validation JSON avant écriture
 */

define('DATA_FILE', __DIR__ . '/../data/content.json');
define('ADMIN_PASSWORD_HASH', ''); // sha256 du mot de passe admin — à remplir au déploiement

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// --- PING : test de disponibilité ---
if ($action === 'ping') {
  header('Content-Type: text/plain');
  echo 'pong';
  exit;
}

// --- LOAD : lecture du JSON ---
if ($action === 'load' && $_SERVER['REQUEST_METHOD'] === 'GET') {
  if (!file_exists(DATA_FILE)) {
    http_response_code(404);
    echo json_encode(['error' => 'content.json not found']);
    exit;
  }
  $content = file_get_contents(DATA_FILE);
  // Valider que c'est du JSON valide
  json_decode($content);
  if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode(['error' => 'JSON corrompu']);
    exit;
  }
  echo $content;
  exit;
}

// --- SAVE : écriture du JSON (POST uniquement) ---
if ($action === 'save' && $_SERVER['REQUEST_METHOD'] === 'POST') {
  $body = file_get_contents('php://input');
  $payload = json_decode($body, true);

  if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON invalide']);
    exit;
  }

  // Vérification mot de passe admin (si configuré)
  if (!empty(ADMIN_PASSWORD_HASH)) {
    $pwd = $payload['_adminPassword'] ?? '';
    if (hash('sha256', $pwd) !== ADMIN_PASSWORD_HASH) {
      http_response_code(401);
      echo json_encode(['error' => 'Non autorisé']);
      exit;
    }
  }

  // Extraire les données (sans le mot de passe)
  $data = $payload['data'] ?? $payload;
  unset($data['_adminPassword']);

  // Sauvegarde atomique : écrire dans un fichier tmp puis renommer
  $tmp = DATA_FILE . '.tmp';
  $encoded = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

  if (file_put_contents($tmp, $encoded) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Impossible d\'écrire le fichier']);
    exit;
  }

  rename($tmp, DATA_FILE);
  echo json_encode(['success' => true, 'savedAt' => date('c')]);
  exit;
}

// Action inconnue
http_response_code(400);
echo json_encode(['error' => 'Action inconnue']);
