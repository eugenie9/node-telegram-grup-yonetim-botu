const TelegramBot = require("node-telegram-bot-api");
const token = process.env.BOT_TOKEN;

if (!token) {
  console.error(
    "HATA: BOT_TOKEN ortam değişkeni tanımlı değil. .env dosyasını kontrol edin.",
  );
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

const kufurler = require("./karaliste");
const veritabani = require("./veritabani");

/**
 * Escapes special characters for Telegram MarkdownV2 parse mode.
 * Characters: _ * [ ] ( ) ~ ` > # + - = | { } . !
 */
function escapeMarkdownV2(text) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

const kufurKontrol = (mesaj) => {
  mesaj = mesaj.split(" ");
  for (let m of mesaj) {
    if (kufurler.includes(m.toLowerCase())) {
      return true;
    }
  }
  return false;
};

bot.on("new_chat_members", async (msg) => {
  const ad = msg.new_chat_member.first_name;
  const karsilama = `Hoşgeldin ${ad}. Sana gerekli izinleri verebilmem için 'Ben bot değilim.' butonuna tıklamayı unutma. Aksi halde bazı özelliklerini kısıtlamak zorunda kalacağım. Danışmak istediğin bir şey varsa yetkili listesini görmek için /admin yazısına tıklaman yeterli. İyi sohbetler.`;

  const keyboard = [];
  const form = {
    can_send_messages: false,
    can_send_media_messages: false,
    can_send_other_messages: false,
    can_send_polls: false,
    can_add_web_page_previews: false,
    can_invite_users: false,
  };

  bot.restrictChatMember(msg.chat.id, msg.new_chat_member.id, form);
  keyboard.push({
    text: `Ben bot değilim.`,
    callback_data: `benBotDegilim ${msg.new_chat_member.id}`,
  });

  const options = { reply_markup: { inline_keyboard: [keyboard] } };

  bot.sendMessage(msg.chat.id, karsilama, options);
});

bot.on("message", async (msg) => {
  if (!msg.text) return;

  if (kufurKontrol(msg.text)) {
    await bot.deleteMessage(msg.chat.id, msg.message_id);
    await bot.sendMessage(
      msg.chat.id,
      `${msg.from.first_name} Mesajını uygunsuz içerik sebebiyle siliyorum. Grupta kullandığın dile dikkat et.`,
    );
    return;
  }

  if (
    msg.reply_to_message != undefined &&
    (msg.text.startsWith("+1") || msg.text.startsWith("👍"))
  ) {
    const arttiran = msg.from.id;
    const arttirilan = msg.reply_to_message.from.id;
    if (arttirilan != arttiran) {
      let arttiranItibar = await veritabani.itibarOgren(arttiran);
      let arttirilanItibar = await veritabani.itibarOgren(arttirilan);
      const arttiranAd = msg.from.first_name;
      const arttirilanAd = msg.reply_to_message.from.first_name;

      arttiranItibar = arttiranItibar == false ? 0 : arttiranItibar;
      arttirilanItibar = arttirilanItibar == false ? 0 : arttirilanItibar;

      await veritabani.itibarArttir(arttirilan, arttirilanAd, arttiran);
      const gecmis = await veritabani.itibarGecmisi(arttirilan);
      const benzersizVerenler = new Set(gecmis.map((g) => g.veren_id));
      const benzersizVeren = benzersizVerenler.size;

      bot.sendMessage(
        msg.chat.id,
        `👍 ${arttiranAd}(${arttiranItibar}), ${arttirilanAd}(${arttirilanItibar}) kullanıcısının itibarını 1 arttırdı. ${arttirilanAd} toplam ${benzersizVeren} farklı kişiden +1 aldı.`,
      );
      return;
    } else {
      bot.sendMessage(msg.chat.id, "Kendi itibarınızı arttıramazsınız.");
      return;
    }
  }

  if (msg.reply_to_message != undefined && msg.text.startsWith("/yetkili")) {
    const yetkiVerilenId = msg.reply_to_message.from.id;
    const yetkiVerilenAd = msg.reply_to_message.from.first_name;
    const yoneticiler = await bot.getChatAdministrators(msg.chat.id);
    const yetki = await veritabani.yetkiKontrol(yetkiVerilenId);

    for (let yonetici of yoneticiler) {
      // Eğer komutu veren adminse
      if (yonetici.user.id == msg.from.id) {
        // Eğer moderatör listesinde yokssa
        if (!yetki) {
          veritabani.moderatorEkle(yetkiVerilenId, yetkiVerilenAd);
          bot.sendMessage(
            msg.chat.id,
            `${yetkiVerilenAd} moderatör listesine eklendi. Artık /sustur ve /sil komutlarını kullanabilirsiniz.`,
          );
          return;
        } else {
          bot.sendMessage(
            msg.chat.id,
            `${yetkiVerilenAd} zaten moderatör listesinde mevcut.`,
          );
          return;
        }
      }
    }

    bot.sendMessage(
      msg.chat.id,
      "Bu komut sadece yöneticiler tarafından kullanılabilir.",
    );
    return;
  }

  if (msg.reply_to_message != undefined && msg.text.startsWith("/yetkiAl")) {
    const yetkiAlinanId = msg.reply_to_message.from.id;
    const yetkiAlinanAd = msg.reply_to_message.from.first_name;
    const yoneticiler = await bot.getChatAdministrators(msg.chat.id);
    const yetki = await veritabani.yetkiKontrol(yetkiAlinanId);

    for (let yonetici of yoneticiler) {
      // Eğer komutu veren adminse
      if (yonetici.user.id == msg.from.id) {
        // Eğer moderatör listesinde varsa
        if (yetki) {
          await veritabani.moderatorKaldir(yetkiAlinanId, yetkiAlinanAd);
          bot.sendMessage(
            msg.chat.id,
            `${yetkiAlinanAd} moderatör listesinden kaldırıldı. Artık /sustur ve /sil gibi moderatör komutlarını kullanamaz.`,
          );
          return;
        } else {
          bot.sendMessage(
            msg.chat.id,
            `${yetkiAlinanAd} zaten moderatör listesinde mevcut değil.`,
          );
          return;
        }
      }
    }

    bot.sendMessage(
      msg.chat.id,
      "Bu komut sadece yöneticiler tarafından kullanılabilir.",
    );
    return;
  }

  if (msg.reply_to_message != undefined && msg.text.startsWith("/sil")) {
    const silinen = msg.reply_to_message.message_id;
    const yoneticiler = await bot.getChatAdministrators(msg.chat.id);
    const yetki = await veritabani.yetkiKontrol(msg.from.id);

    for (let yonetici of yoneticiler) {
      if (yonetici.user.id == msg.from.id) {
        bot.deleteMessage(msg.chat.id, silinen);
        return;
      }
    }

    if (yetki) {
      bot.deleteMessage(msg.chat.id, silinen);
      return;
    } else {
      bot.sendMessage(
        msg.chat.id,
        "Bu komut sadece yöneticiler ve moderatörler tarafından kullanılabilir.",
      );
      return;
    }
  }

  if (msg.reply_to_message != undefined && msg.text.startsWith("/sustur")) {
    const susturulan = msg.reply_to_message.from.id;
    const ad = msg.reply_to_message.from.first_name;
    const chat = msg.chat.id;

    const form = {
      can_send_messages: false,
      can_send_media_messages: false,
      can_send_other_messages: false,
      can_send_polls: false,
      can_add_web_page_previews: false,
      can_invite_users: false,
    };

    const yoneticiler = await bot.getChatAdministrators(msg.chat.id);
    const yetki = await veritabani.yetkiKontrol(msg.from.id);

    for (let yonetici of yoneticiler) {
      if (yonetici.user.id == msg.from.id) {
        bot.restrictChatMember(chat, susturulan, form);
        bot.sendMessage(
          chat,
          `${ad} artık gruba herhangi bir mesaj gönderemez.`,
        );
        return;
      }
    }

    if (yetki) {
      bot.restrictChatMember(chat, susturulan, form);
      bot.sendMessage(chat, `${ad} artık gruba herhangi bir mesaj gönderemez.`);
      return;
    } else {
      bot.sendMessage(
        msg.chat.id,
        "Bu komut sadece yöneticiler ve moderatörler tarafından kullanılabilir.",
      );
      return;
    }
  }

  if (msg.reply_to_message != undefined && msg.text.startsWith("/kaldır")) {
    const susturulan = msg.reply_to_message.from.id;
    const ad = msg.reply_to_message.from.first_name;
    const chat = msg.chat.id;

    const form = {
      can_send_messages: true,
      can_send_media_messages: true,
      can_send_other_messages: true,
      can_send_polls: true,
      can_add_web_page_previews: true,
      can_invite_users: true,
    };

    const yoneticiler = await bot.getChatAdministrators(msg.chat.id);
    const yetki = await veritabani.yetkiKontrol(msg.from.id);

    for (let yonetici of yoneticiler) {
      if (yonetici.user.id == msg.from.id) {
        bot.restrictChatMember(chat, susturulan, form);
        bot.sendMessage(chat, `${ad} kullanıcısının yasağı kaldırıldı.`);
        return;
      }
    }

    if (yetki) {
      bot.restrictChatMember(chat, susturulan, form);
      bot.sendMessage(chat, `${ad} kullanıcısının yasağı kaldırıldı.`);
      return;
    } else {
      bot.sendMessage(
        msg.chat.id,
        "Bu komut sadece yöneticiler ve moderatörler tarafından kullanılabilir.",
      );
      return;
    }
  }

  if (msg.text.startsWith("/top5")) {
    const topKullanicilar = await veritabani.top5();

    if (topKullanicilar.length === 0) {
      bot.sendMessage(msg.chat.id, "Henüz hiç kimse +1 almamış.");
      return;
    }

    let mesaj = "*🏆 En Çok +1 Alanlar*\n\n";
    const emojiler = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

    for (let i = 0; i < topKullanicilar.length; i++) {
      const k = topKullanicilar[i];
      mesaj += `${emojiler[i]} ${escapeMarkdownV2(k.name)} — *${k.itibar}*\n`;
    }

    bot.sendMessage(msg.chat.id, mesaj, { parse_mode: "MarkdownV2" });
    return;
  }

  if (msg.text.startsWith("/admin")) {
    const yoneticiler = await bot.getChatAdministrators(msg.chat.id);
    const moderatorler = await veritabani.moderatorListesi();

    let mesaj = "*Grup Sahibi*\n";
    const yoneticiIsimleri = [];
    const moderatorIsimleri = [];

    for (const yonetici of yoneticiler) {
      if (!yonetici.user.is_bot) {
        if (yonetici.status == "creator") {
          mesaj += escapeMarkdownV2(yonetici.user.first_name);
        } else {
          yoneticiIsimleri.push(escapeMarkdownV2(yonetici.user.first_name));
        }
      }
    }

    for (const moderator of moderatorler) {
      moderatorIsimleri.push(escapeMarkdownV2(moderator.name));
    }

    if (yoneticiIsimleri.length > 0) {
      mesaj += "\n\n*Yöneticiler*\n" + yoneticiIsimleri.join("\n");
    }

    if (moderatorIsimleri.length > 0) {
      mesaj += "\n\n*Moderatörler*\n" + moderatorIsimleri.join("\n");
    }

    bot.sendMessage(msg.chat.id, mesaj, { parse_mode: "MarkdownV2" });
  }
});

bot.on("callback_query", async function onCallbackQuery(callbackQuery) {
  const action = callbackQuery.data;

  if (action.startsWith("benBotDegilim")) {
    const args = action.split(" ");
    const msg = callbackQuery;
    const chatId = msg.message.chat.id;
    const userId = msg.from.id;
    const msgId = msg.message.message_id;

    if (userId == args[1]) {
      bot.answerCallbackQuery(callbackQuery.id, {
        text: `Doğrulama için teşekkür ederim. Grubumuza tekrardan hoşgeldiniz.`,
        show_alert: true,
      });

      const form = {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_other_messages: true,
        can_send_polls: true,
        can_add_web_page_previews: true,
        can_invite_users: true,
      };

      bot.deleteMessage(chatId, msgId);
      bot.restrictChatMember(chatId, args[1], form);
    } else {
      bot.answerCallbackQuery(callbackQuery.id, {
        text: `Bu doğrulama butonu sizin için değil.`,
        show_alert: true,
      });
    }

    return;
  }
});
