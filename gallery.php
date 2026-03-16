<?php
// gallery.php - возвращает структуру папки gallery в формате JSON

// Запрещаем прямой доступ к файлу
if (basename($_SERVER['PHP_SELF']) == basename(__FILE__)) {
    header('Content-Type: application/json');
}

// Разрешённые расширения изображений
$allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

// Функция рекурсивного сканирования
function scanGallery($dir, $basePath = 'gallery/') {
    global $allowed_extensions;
    
    $result = [];
    $items = scandir($dir);
    
    // Сначала обрабатываем папки, потом файлы – для красоты
    $folders = [];
    $files = [];
    
    foreach ($items as $item) {
        if ($item == '.' || $item == '..') continue;
        
        $path = $dir . '/' . $item;
        $relativePath = $basePath . $item;
        
        if (is_dir($path)) {
            // Рекурсивно сканируем подпапку
            $sub = scanGallery($path, $relativePath . '/');
            if (!empty($sub)) {
                $folders[$item] = $sub;
            }
        } else {
            // Проверяем расширение
            $ext = strtolower(pathinfo($item, PATHINFO_EXTENSION));
            if (in_array($ext, $allowed_extensions)) {
                $files[] = $relativePath;
            }
        }
    }
    
    // Сортируем папки и файлы по алфавиту
    ksort($folders);
    sort($files);
    
    // Формируем результат: если есть файлы, кладём их в ключ 'images'
    if (!empty($files)) {
        $result['images'] = $files;
    }
    
    // Добавляем папки
    foreach ($folders as $name => $content) {
        $result[$name] = $content;
    }
    
    return $result;
}

// Путь к папке с галереей (относительно корня сайта)
$galleryPath = __DIR__ . '/gallery';

if (!is_dir($galleryPath)) {
    // Если папки нет, возвращаем пустой массив
    echo json_encode([]);
    exit;
}

$structure = scanGallery($galleryPath);
echo json_encode($structure, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>