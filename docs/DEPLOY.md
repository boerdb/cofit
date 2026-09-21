# Cofit ganzenbord deployen (Next + PM2)

Zelfde aanpak als Scheikunde / BrotherDruk.

## Architectuur

- **Next.js** op server **NEXT** (`192.168.1.32`) → `/var/www/cofit` → poort **3006**
- **PM2** procesnaam: `cofit`
- GitHub: `git@github.com:boerdb/cofit.git` (branch `main`)

```
Telefoon/LAN → http://192.168.1.32:3006 → Next.js
```

## Eerste installatie

Vanaf je PC:

```bash
python scripts/deploy_git_init.py
```

Of handmatig op de server:

```bash
cd /var/www
git clone git@github.com:boerdb/cofit.git cofit
cd cofit
npm ci
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

## Updates

```bash
python scripts/deploy_pull.py
```

Of op de server:

```bash
cd /var/www/cofit
git pull
npm ci
npm run build
pm2 restart cofit --update-env
```

## Controle

```bash
pm2 list | grep cofit
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3006/
```

App: http://192.168.1.32:3006
