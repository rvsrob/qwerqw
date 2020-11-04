if (process.version.slice(1).split(".")[0] < 8)
  throw new Error(
    "Node 8.0.0 or higher is required. Update Node on your system."
  );

const Discord = require("discord.js");
const client = new Discord.Client();
const bot = new Discord.Client();
const { RichEmbed } = require("discord.js");
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const chalk = require("chalk");
const fs = require("fs");
const { stripIndents } = require("common-tags");
const moment = require("moment");
const http = require('http');
const express = require("express")
/////////////////////////HTTPS///////////////////////////////////////

const db = require("quick.db");
const jimp = require("jimp");
const Jimp = require("jimp");
const snekfetch = require("snekfetch");

require("./modüller/fonksiyonlar.js")(client);
require("./util/eventLoader")(client);
client.config = require("./config.js");

client.ayarlar = {
  oynuyor: "oynuyor",
  official_sahip: "",
  sahip: [""],
  isim: "",
  webpanel: "",
  versiyon: "0.1",
  prefix: "-",
  renk: "#fff",
  token: client.config.token,
  version: "0.1"
};
const ayarlar = client.ayarlar;
const log = message => {
  console.log(`${chalk.red(`»`)} ${message}`);
};

client.ayar = db;

//////////////////////////////////////////////////////////////////////////////////////////
client.on("ready", async () => {
  client.user.setActivity(`m!yardım | m!kur | m!sıfırla`)
  client.appInfo = await client.fetchApplication();
  setInterval(async () => {
    client.appInfo = await client.fetchApplication();
  }, 60000);

  require("./modüller/panel.js")(client);
});
//////////////////////////////////////////////////////////////////////////////////////////

client.on("guildMemberAdd", async member => {
  let sat = await db.fetch(`kategori_${member.guild.id}`);
  let sa = await db.fetch(`toplamk_${member.guild.id}`);
  let sa1 = await db.fetch(`botk_${member.guild.id}`);
  let sa2 = await db.fetch(`aktif_${member.guild.id}`);
  let sa3 = await db.fetch(`rekor_${member.guild.id}`);
  let sa4 = await db.fetch(`son_${member.guild.id}`);
  if (!sat) return;
  if (!sa) return;
  if (!sa1) return;
  if (!sa2) return;
  if (!sa3) return;
  if (!sa4) return;
  try {
    let isim =
      (await db.fetch(`isimtoplam_${member.guild.id}`)) ||
      `» Toplam Üye {toplamüye}`;
    member.guild.channels
      .get(sa)
      .setName(isim.replace(`{toplamüye}`, member.guild.memberCount));
  } catch (err) {
    return;
  }
  try {
    let isim2 =
      (await db.fetch(`isimsonüye_${member.guild.id}`)) ||
      `» Son Üye: {sonüye}`;
    member.guild.channels
      .get(sa4)
      .setName(isim2.replace(`{sonüye}`, member.user.tag));
  } catch (err) {
    return;
  }
  if (client.users.get(member.id).bot) {
    try {
      let isim3 =
        (await db.fetch(`isimbot_${member.guild.id}`)) ||
        `» Toplam Bot {toplambot}`;
      member.guild.channels
        .get(sa1)
        .setName(
          isim3.replace(
            `{toplambot}`,
            member.guild.members.filter(m => m.user.bot).size
          )
        );
    } catch (err) {
      return;
    }
  }
});

client.on("guildMemberRemove", async member => {
  let sat = await db.fetch(`kategori_${member.guild.id}`);
  let sa = await db.fetch(`toplamk_${member.guild.id}`);
  let sa1 = await db.fetch(`botk_${member.guild.id}`);
  let sa2 = await db.fetch(`aktif_${member.guild.id}`);
  let sa3 = await db.fetch(`rekor_${member.guild.id}`);
  let sa4 = await db.fetch(`son_${member.guild.id}`);
  if (!sat) return;
  if (!sa) return;
  if (!sa1) return;
  if (!sa2) return;
  if (!sa3) return;
  if (!sa4) return;
  try {
    let isim =
      (await db.fetch(`isimtoplam_${member.guild.id}`)) ||
      `» Toplam Üye {toplamüye}`;
    member.guild.channels
      .get(sa)
      .setName(isim.replace(`{toplamüye}`, member.guild.memberCount));
  } catch (err) {
    return;
  }
  if (client.users.get(member.id).bot) {
    try {
      let isim3 =
        (await db.fetch(`isimbot_${member.guild.id}`)) ||
        `» Toplam Bot {toplambot}`;
      member.guild.channels
        .get(sa1)
        .setName(
          isim3.replace(
            `{toplambot}`,
            member.guild.members.filter(m => m.user.bot).size
          )
        );
    } catch (err) {
      return;
    }
  }
});

client.on("message", async message => {
  let sa2 = await db.fetch(`aktif_${message.guild.id}`);
  let kanal = await db.fetch(`rekor_${message.guild.id}`);
  let rekoronline = await db.fetch(`panelrekor_${message.guild.id}`);
  try {
    let isim1 =
      (await db.fetch(`isimaktif_${message.guild.id}`)) ||
      `» Toplam Aktif {toplamaktif}`;
    message.guild.channels
      .get(sa2)
      .setName(
        isim1.replace(
          `{toplamaktif}`,
          message.guild.members.filter(off => off.presence.status !== "offline")
            .size
        )
      );
  } catch (err) {
    return;
  }
  if (
    message.guild.members.filter(off => off.presence.status !== "offline")
      .size > rekoronline
  ) {
    db.set(
      `panelrekor_${message.guild.id}`,
      message.guild.members.filter(off => off.presence.status !== "offline")
        .size
    );
    let kontrole = await db.fetch(`panelrekor_${message.guild.id}`);
    try {
      let isim2 =
        (await db.fetch(`isimrekoraktif_${message.guild.id}`)) ||
        `» Rekor Aktif {rekoraktif}`;
      message.guild.channels
        .get(kanal)
        .setName(isim2.replace(`{rekoraktif}`, kontrole));
    } catch (err) {
      return;
    }
  }
});

//////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Komut - ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.on('guildDelete', guild => {
let batu = new Discord.MessageEmbed()
.setColor("RED")
.setTitle(" Bot Kickledi ")
.addField("Sunucu Adı:", guild.name)
.addField("Sunucu sahibi", guild.owner)
.addField("Sunucu Sahibi'nin ID'si", guild.ownerID)
.addField("Sunucunun Kurulu Olduğu Bölge:", guild.region)
.addField("Sunucudaki Kişi Sayısı:", guild.memberCount)
   client.channels.cache.get('737371969024032794').send(batu);
});
client.on('guildCreate', guild => {
let batu = new Discord.MessageEmbed()
.setColor("GREEN")
.setTitle(" Bot Eklendi ")
.addField("Sunucu Adı:", guild.name)
.addField("Sunucu sahibi", guild.owner)
.addField("Sunucu Sahibi'nin ID'si", guild.ownerID)
.addField("Sunucunun Kurulu Olduğu Bölge:", guild.region)
.addField("Sunucudaki Kişi Sayısı:", guild.memberCount)
   client.channels.cache.get('737371969024032794').send(batu);
});
///////////////////////////////////////
client.ekoayarlar = {
  parabirimi: "TL",
  botunuzunprefixi: "m!",
  botunuzunidsi: "756431214830682183",
  botismi: "Moderation Stats",
  renk: "RANDOM", //İNGİLİZCE TERCİH ETTİĞİNİZ RENGİ YAZINIZ! EĞER BÖYLE BIRAKIRSANIZ RASTGELE ATAR!
  isimsiz: "Bilinmiyor", //İSİMSİZ KİŞİLERİN HANGİ İSİM İLE GÖZÜKECEĞİNİ BELİRLEYEBİLİRSİNİZ!
  rastgelepara: true, //EĞER BUNU TRUE YAPARSANIZ RASTGELE PARA VERME ÖZELLİĞİ AKTİF OLUR VE GÜNLÜK PARALARI RASTGELE VERİR!
  minpara: 10, //EĞER RASTGELE PARA DURUMUNU AKTİF ETTİYSENİZ BURADAN RASTGELE PARA PARAMETRESİNİNİN MİNUMUM PARASINI BELİRTİNİZ!
  maxpara: 200, //EĞER RASTGELE PARA DURUMUNU AKTİF ETTİYSENİZ BURADAN RASTGELE PARA PARAMETRESİNİNİN MAXİMUM PARASINI BELİRTİNİZ!
  günlükpara: 50, //EĞER RASTGELE PARAYI TRUE YAPTIYSANIZ BURAYI ELLEMENİZE GEREK YOK!
  dbloy: false, //EĞER BOTUNUZ DBL (DİSCORD BOT LİST) DE KAYITLIYSA GÜNLÜK ÖDÜL ALMAK İÇİN OY İSTER FALSE KAPALI, TRUE AKTİF DEMEK!
  dblkey: "KEY", //EĞER DBLOY U AKTİF ETMEDİYSENİZ BURAYA KEY EKLEMENİZE GEREK YOK EĞER AKTİF ETTİYSENİZ DBL SİTESİNDEN BULABİLİRSİNİZ!
  dblmsj: "", //EĞER DBLOY U AKTİF ETMEDİYSENİZ BURAYA MESAJ YAZMANIZA GEREK YOK! EĞER AKTİF ETTİYSENİZ BOTA OY VERMEK İÇİN HANGİ MESAJI YAZACAĞINI AYARLAYABİLİRSİNİZ.
  başlangıçparası: 50, //EĞER RASTGELE PARAYI TRUE YAPTIYSANIZ BURAYI ELLEMENİZE GEREK YOK!
  admin: ["700805030521077812"]
}
const kurulum = message => {
  console.log(`Kurulum: ${message}`);
};

///////////////////////////

///////////////////////
client.elevation = message => {
  if (!message.guild) {
    return;
  }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.official_sahip) permlvl = 4;
  return permlvl;
};

//////////////////////////////////////////////////////////////////////////////////////////
client.login(ayarlar.token);
