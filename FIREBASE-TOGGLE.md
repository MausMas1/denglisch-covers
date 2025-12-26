# 🔌 Firebase Aan/Uit Zetten

## 🔴 OFFLINE ZETTEN (Afsluiten)

### Stap 1: Ga naar Firebase Console
1. Open: https://console.firebase.google.com
2. Klik op project: **denglisch-covers**

### Stap 2: Database Regels Aanpassen
1. Klik links op **"Realtime Database"**
2. Klik bovenaan op **"Rules"** tab
3. Vervang ALLES met:

```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

4. Klik **"Publish"**

### Stap 3: Storage Regels Aanpassen
1. Klik links op **"Storage"**
2. Klik bovenaan op **"Rules"** tab
3. Vervang ALLES met:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if false;
      allow write: if false;
    }
  }
}
```

4. Klik **"Publish"**

✅ **Klaar!** De app is nu offline.

---

## 🟢 ONLINE ZETTEN (Activeren)

### Stap 1: Ga naar Firebase Console
1. Open: https://console.firebase.google.com
2. Klik op project: **denglisch-covers**

### Stap 2: Database Regels Aanpassen
1. Klik links op **"Realtime Database"**
2. Klik bovenaan op **"Rules"** tab
3. Vervang ALLES met:

```json
{
  "rules": {
    ".read": true,
    
    "gameState": { ".write": true },
    "songs": { ".write": true },
    "answers": { ".write": true },
    "typing": { ".write": true },
    "emojiReactions": { ".write": true },
    "accessCodes": { ".write": true },
    "audioProgress": { ".write": true },
    "audioDuration": { ".write": true },
    "audioCurrentTime": { ".write": true },
    "enableDisplayAudio": { ".write": true },
    "seekCommand": { ".write": true },
    
    "$other": { ".write": false }
  }
}
```

4. Klik **"Publish"**

### Stap 3: Storage Regels Aanpassen
1. Klik links op **"Storage"**
2. Klik bovenaan op **"Rules"** tab
3. Vervang ALLES met:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

4. Klik **"Publish"**

✅ **Klaar!** De app is nu online.

---

## ⏱️ Tijdsindicatie
- Offline zetten: ~2 minuten
- Online zetten: ~2 minuten
