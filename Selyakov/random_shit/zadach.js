//Задание 1
console.log('\n')
const numbers = [1,2,3,4,5,100,200]
numbers.forEach(el => console.log(el))
const newnumders = numbers.map(el => el * 3)
console.log(newnumders)
const filter = numbers.filter(el => el > 10)
console.log(filter)
//Задание 2
console.log('\n')
const tranz = [100, -50, 200, -30, 150]
const obsh = tranz.reduce((sum, tranz) => sum + tranz)
console.log(obsh)
const minus = tranz
const dada = minus.filter(tranz => tranz < 0)
const nono = dada.reduce((sum, minus) => sum + minus, 0)
console.log(nono)
const plus = tranz
const jpp = plus.filter(tranz => tranz > 0)
const paa = jpp.reduce((sum, plus)=> sum + plus, 0)
console.log(paa)
//Задание 3
console.log('\n')
const playlist = ["Грибы","Fendi","Brawl Stars"]
playlist.push("Песня для брутальных пацанов","Дядя тетя")
let firstSong = playlist.shift();
console.log("Origin Playlist:",playlist)
playlist[2] = "Новый Мэрин"
playlist.splice(2,0,"TRAXXXMANIA")
playlist.splice(3,1,"Тает лёд","Кубик Льда")
console.log("Updated Playlist:",playlist)
//Задание 4
console.log('\n') // перенос строки для удобства
function normalizeSentence(str){
  let normalized = str.trim().replace(/\s+/g, ' ');
  normalized = normalized.replace(/js/gi, 'JavaScript');
  const words = normalized.split(' ');
  const lowcaseWords = words.map(word => word.toLowerCase());
  if (lowcaseWords.length > 0) {
      lowcaseWords[0] = lowcaseWords[0].charAt(0).toUpperCase() + lowcaseWords[0].slice(1);
  }
  return lowcaseWords.join(' ');
}
console.log (normalizeSentence("ArBuzniy    JS lubit Играть!"))
//Задание 5
console.log('\n')
const user = {
  name: 'Alex',
  age: 28,
  roles: ['user', 'admin'],
  address: {
    city: 'Moscow',
    zip: '101000'
  }
};
const userCopy = { ...user, name: 'Sasha' };
const keys = Object.keys(userCopy);
const values = Object.values(userCopy);
const entries = Object.entries(userCopy);
const restoredUser = Object.fromEntries(entries);
const { name, address: { city } } = userCopy;

console.log('Keys:', keys);
console.log('Values:', values);
console.log('Entries:', entries);
console.log('Restored:', restoredUser);
console.log('Name:', name);
console.log('City:', city);
