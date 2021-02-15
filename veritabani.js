const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('veritabani.json')
const db = low(adapter)

db.defaults({
  "moderatorler": [],
  "itibar": []
}).write()

const moderatorEkle = async(id,name) => {
  let kullanici = await db.get("moderatorler").find({id}).value()

  if(kullanici==undefined) {
    db.get("moderatorler").push({id, name}).write()
  } 
}

const moderatorKaldir = async(id,name) => {
  let kullanici = await db.get("moderatorler").find({id}).value()

  if(kullanici!=undefined) {
    db.get("moderatorler").pull(kullanici).write()
  } 
}

const yetkiKontrol = async(id) => {
  let kullanici = await db.get("moderatorler").find({id}).value()

  if(kullanici==undefined) {
    return false
  } else {
    return true
  }
}

const moderatorListesi = async() => await db.get("moderatorler").value()

const itibarOgren = async(id) => {
  let kullanici = await db.get("itibar").find({id}).value()
  if(kullanici==undefined) {
    return false
  } else {
    return kullanici.itibar
  }
}

const itibarArttir = async(id, name) => {
  let kullanici = await db.get("itibar").find({id}).value()

  if(kullanici==undefined) {
    db.get("itibar").push({id, name, itibar:1}).write()
  } else {
    db.get("itibar").find({id}).assign({name, itibar: kullanici.itibar+1}).write()
  }
}


let veritabani = {
  moderatorEkle,
  moderatorKaldir,
  yetkiKontrol,
  moderatorListesi,
  itibarOgren,
  itibarArttir
}

module.exports = veritabani