# Развёртывание Doorium API на VPS

## Требования
- Ubuntu 22/24 с root-доступом
- Node.js 20+
- PostgreSQL 15+
- Nginx (reverse proxy)
- S3-совместимое хранилище (Timeweb S3)

## 1. Установка софта

```bash
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs postgresql postgresql-contrib nginx certbot python3-certbot-nginx
npm install -g pm2
```

## 2. Настройка PostgreSQL

```bash
sudo -u postgres psql
```

```sql
CREATE USER doorium WITH PASSWORD 'ваш_надёжный_пароль';
CREATE DATABASE doorium_db OWNER doorium;
\q
```

## 3. Создание таблиц

```bash
sudo -u postgres psql -d doorium_db -f /var/www/api/schema.sql
```

## 4. Генерация пароля администратора

```bash
cd /var/www/api
node -e "require('bcrypt').hash('ВАШ_ПАРОЛЬ', 10).then(h => console.log(h))"
```

Вставьте полученный хеш в таблицу users:

```bash
sudo -u postgres psql -d doorium_db -c "UPDATE users SET password_hash = 'ПОЛУЧЕННЫЙ_ХЕШ' WHERE email = 'admin@doorium.ru'"
```

## 5. Настройка проекта

```bash
mkdir -p /var/www/api
cd /var/www/api

# Скопируйте файлы: server.js, bot.js, package.json, schema.sql
# Из папки backend/ вашего проекта

npm install

# Создайте .env файл
cp .env.example .env
nano .env
# Заполните все переменные (DATABASE_URL, JWT_SECRET, S3 ключи и т.д.)
```

### Генерация JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Генерация VAPID ключей (для push-уведомлений):
```bash
npx web-push generate-vapid-keys
```

## 6. Запуск через PM2

```bash
cd /var/www/api
pm2 start server.js --name doorium-api
pm2 start bot.js --name doorium-bot
pm2 save
pm2 startup
```

## 7. Nginx reverse proxy

Создайте `/etc/nginx/sites-available/api.doorium.ru`:

```nginx
server {
    listen 80;
    server_name api.doorium.ru;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 20M;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/api.doorium.ru /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 8. SSL сертификат

Направьте DNS `api.doorium.ru` → IP вашего VPS, затем:

```bash
certbot --nginx -d api.doorium.ru
```

## 9. Проверка

```bash
curl https://api.doorium.ru/health
# Должно вернуть: {"status":"ok","db":"connected","s3":"..."}
```

## 10. Подключение фронтенда

После настройки API скажите мне URL вашего сервера (например `https://api.doorium.ru`),
и я обновлю `VITE_API_URL` на фронтенде.

## Полезные команды

```bash
pm2 logs doorium-api     # Логи API
pm2 logs doorium-bot     # Логи бота
pm2 restart doorium-api  # Перезапуск API
pm2 status               # Статус процессов
```
