<?php
declare(strict_types=1);

class Database
{
    private static ?PDO $connection = null;

    public static function getConnection(): PDO
    {
        if (self::$connection !== null) {
            return self::$connection;
        }

        $host = 'sql211.infinityfree.com';
        $db   = 'if0_41355438_web_ban_dien_thoai';
        $user = 'if0_41355438';
        $pass = 'wcV7zaKnuW4';
        $charset = 'utf8mb4';

        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        self::$connection = new PDO($dsn, $user, $pass, $options);

        return self::$connection;
    }
}