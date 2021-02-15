# node-telegram-grup-yonetim-botu

Telegram gruplarının yönetiminde yardımcı olma amacıyla yazılmış bir bot.

**Özellikler**

- [x] Yeni üye girişlerinde bot/spam kontrolü
- [x] Grup içi moderatör sistemi
- [x] Grup içi yönetim komutları
- [x] Grup içi itibar sistemi
- [x] Grup içi hakaret/küfür koruma sistemi
- [ ] İtibar tabanlı otomatik grup içi seviyeler
- [ ] Grup içi istatistikler

**Kullanım Komutları**

- /sustur - Bir mesajı yanıtla yaparak /sustur yazılırsa, mesaj sahibi kullanıcı grupta herhangi bir türden (yazı, görsel, anket vs.) mesaj gönderemez. **Sadece yöneticiler ve moderatörler kullanabilir.**
- /sil - Bir mesajı yanıtla yaparak /sil yazılırsa yanıtlanan mesaj gruptan silinir. **Sadece yöneticiler ve moderatörler kullanabilir.**
- /yetkili - Bir yönetici bir mesajı yanıtlayarak /yetkili yazarsa mesaj sahibi kullanıcı grubun moderatör listesine eklenir ve artık yetkili komutlarını kullanabilir. **Sadece yöneticiler kullanabilir.**
- /yetkiAl - Bir moderatörün mesajı yanıtlanarak /yetkiAl yazılırsa kullanıcı moderatör listesinden kaldırılır ve yetkili komutlarını kullanabilme yetkisini kaybeder. **Sadece yöneticiler kullanabilir.**
- /admin - Gruptaki yönetici ve moderatörleri listeler.
- +1 / 👍 - Bir mesaj yanıtlanarak +1 ya da 👍 emojisi gönderilirse yanıtlanan mesaj sahibinin itibarı arttırılır.

Telegram üzerinde bot oluşturabilmek için [BotFather](https://t.me/BotFather)'a giderek bir takım süreçleri tamamlamanız gerekiyor. Botunuzu oluşturduktan sonra API Token bilgilerinizi alarak main.js dosyasındaki token kısmına yapıştırdıktan sonra botu kullanmaya başlayabilirsiniz.

Bu botu komünite grubumuz olan [Bull Academy](https://t.me/BullAcademy)'de grup içi ara yönetim seviyeleri ve itibar sistemi oluşturmak için geliştirmiştim, daha sonrasında açık kaynak hale getirmeye karar verdim. Ekleyeceğiniz özellikleri forklayarak ya da bu proje üzerinden göndermekten çekinmeyin lütfen.

Grup içi hakaret/küfür kontrolünde [Özcan Oğuz](https://github.com/ooguz/)'un [turkce-kufur-karaliste](https://github.com/ooguz/turkce-kufur-karaliste) projesini kullandım. Kelime eklemek/çıkarmak için karaliste.js dosyasını düzenleyebilirsiniz.

Yeni giren kullanıcıların tüm mesaj alma yetkileri alınır ve susturulur. Karşılama mesajında yer alan "Ben bot değilim" butonuna tıklanılmasının ardından bot tarafından kullanıcının tüm yasakları kaldırılır. Bu özellik bot hesapların grubu spamlamasının önüne geçmek için eklendi.

**ÖNEMLİ NOT**: Botun tüm özelliklerini kullanabilmek için grubun "supergroup" statüsünde olması gerekmektedir.
