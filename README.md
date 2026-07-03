# node-telegram-grup-yonetim-botu

Telegram gruplarının yönetiminde yardımcı olma amacıyla yazılmış bir bot.

## Özellikler

- [x] Yeni üye girişlerinde bot/spam kontrolü
- [x] Grup içi moderatör sistemi
- [x] Grup içi yönetim komutları
- [x] Grup içi itibar sistemi (+1 geçmişi takibi)
- [x] **Liderlik tablosu** — `/top5` ile en çok +1 alanlar
- [x] Grup içi hakaret/küfür koruma sistemi
- [x] `/kurallar` komutu — basit grup kuralları
- [ ] Komutlar aracılığıyla grup kurallarının/karşılama mesajlarının özelleştirilmesi
- [ ] İtibar tabanlı otomatik grup içi seviyeler
- [ ] Grup içi istatistikler

## Kurulum

```bash
git clone https://github.com/eugenie9/node-telegram-grup-yonetim-botu.git
cd node-telegram-grup-yonetim-botu
npm install
```

### Ortam Değişkenleri

Bot token'ı `.env` dosyasından okunur. `.env.example` dosyasını kopyalayıp kendi token'ınızı girin:

```bash
cp .env.example .env
# .env dosyasını açıp BOT_TOKEN=... kısmını düzenleyin
```

Node.js 20.6+ gereklidir (`--env-file` desteği için). Botu başlatmak için:

```bash
npm start
# veya manuel olarak:
node --env-file=.env main.js
```

## Kullanım Komutları

| Komut | Açıklama | Yetki |
|---|---|---|
| `/sustur` | Yanıtlanan mesajın sahibini susturur (yazı, görsel, anket vs. gönderemez) | Yönetici & Moderatör |
| `/kaldır` | Yanıtlanan mesajın sahibinin susturmasını kaldırır | Yönetici & Moderatör |
| `/sil` | Yanıtlanan mesajı gruptan siler | Yönetici & Moderatör |
| `/yetkili` | Yanıtlanan mesajın sahibini moderatör listesine ekler | Yalnızca Yönetici |
| `/yetkiAl` | Yanıtlanan mesajın sahibini moderatör listesinden kaldırır | Yalnızca Yönetici |
| `/admin` | Gruptaki yönetici ve moderatörleri listeler | Herkes |
| `/kurallar` | Grup kurallarını gösterir | Herkes |
| `/top5` | En çok +1 alan ilk 5 kullanıcıyı gösterir | Herkes |
| `+1` / `👍` | Yanıtlanan mesajın sahibine +1 itibar verir | Herkes |

### +1 Geçmişi

Her +1 olayı `itibar_gecmisi` tablosunda kimin kime +1 verdiği şeklinde kronolojik olarak kaydedilir. `/top5` komutu ile liderlik tablosu görüntülenebilir.

## Teknik Detaylar

- **Veritabanı:** SQLite ([`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3)) — `veritabani.db`
- **Ortam değişkenleri:** Node.js native `--env-file` (`.env` dosyası)
- **Node.js:** v20.6+ gerekli

### Proje Yapısı

| Dosya | Açıklama |
|---|---|
| [`main.js`](main.js) | Botun ana dosyası — tüm komut ve olay işleyicileri |
| [`veritabani.js`](veritabani.js) | SQLite veritabanı işlemleri (moderatör, itibar, +1 geçmişi) |
| [`accountAge.js`](accountAge.js) | Telegram ID'sinden hesap yaşı tahmini (ID interpolasyonu) |
| [`karaliste.js`](karaliste.js) | Küfür/hakaret filtresi kelime listesi |

## Geçmiş

Bu botu komünite grubumuz olan [Bull Academy](https://t.me/BullAcademy)'de grup içi ara yönetim seviyeleri ve itibar sistemi oluşturmak için geliştirmiştim, daha sonrasında açık kaynak hale getirmeye karar verdim. Ekleyeceğiniz özellikleri forklayarak ya da bu proje üzerinden göndermekten çekinmeyin lütfen.

Grup içi hakaret/küfür kontrolünde [Özcan Oğuz](https://github.com/ooguz/)'un [turkce-kufur-karaliste](https://github.com/ooguz/turkce-kufur-karaliste) projesini kullandım. Kelime eklemek/çıkarmak için [`karaliste.js`](karaliste.js) dosyasını düzenleyebilirsiniz.

Yeni giren kullanıcıların tüm mesaj alma yetkileri alınır ve susturulur. Karşılama mesajında yer alan "Ben bot değilim" butonuna tıklanılmasının ardından bot tarafından kullanıcının tüm yasakları kaldırılır. Bu özellik bot hesapların grubu spamlamasının önüne geçmek için eklendi.

**ÖNEMLİ NOT**: Botun tüm özelliklerini kullanabilmek için grubun "supergroup" statüsünde olması gerekmektedir.
