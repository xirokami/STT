let readline = require("readline-sync");
function getRandom(min, max) {
  let minCeiled = Math.ceil(min);
  let maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}
let col = [
    '\x1b[1m', //0 - bright
    '\x1b[36m', //1 - cyan
    '\x1b[33m', //2 - yellow
    '\x1b[35m' //3 - magenta

]
let stl = [
    '\x1b[0m', //0 - reset
    col[0]+col[2] //1 - buttons
]

class Player{
    constructor(id,name,strengh,agility,intel,lvl){
        this.id = id
        this.name = name
        this.hp = strengh*2
        this.def = agility*2
        this.res = intel*2
        this.strengh = strengh
        this.agility = agility
        this.intel = intel
        this.lvl = lvl
    }
    charCheck(){
        console.log(this.name+this.lvl+'\n'+this.hp+'\n'+this.def+'\n')
    }
}

class Mob{
    constructor(name,hp,dmg){
        this.name = name
        this.hp = hp
        this.dmg = dmg
    }
}

let players = []
let countId = 0
let Menu = 1
let gameRun = 1

function clear(){
    process.stdout.write('\x1Bc')
}
function showPlayers(){
    players.forEach((plr) => console.log(plr.id,plr.name))
}
while (Menu == 1){
    clear()
    console.log(stl[1]+"[1]"+stl[0]+"Create character\n"+stl[1]+"[2]"+stl[0]+"Play\n"+stl[1]+"[3]"+stl[0]+"Leave")
    let com = readline.question()

    switch(com){
        case "1":
            clear()
            let name = readline.question("Choose character name: ")
            let strengh = getRandom(1,5)
            let agility = getRandom(1,5)
            let intel = getRandom(1,5)
            let id = countId
            countId++
            players[id] = new Player(id,name,strengh,agility,intel,1)    
        break

        case "2":
            clear() 
            if (countId == 0){
                console.log("No playable character, create one in menu.")
                readline.question()
                break
            }
            else{
            showPlayers()
            let plr = readline.question()
            }
            while (gameRun == 1){
                clear()
                console.log(stl[1]+"[1]"+stl[0]+"Fight\n"+stl[1]+"[2]"+stl[0]+"Character\n"+stl[1]+"[3]"+stl[0]+"Leave"+stl[0])
                com = readline.question()
                switch(com){
                    case "1":
                        let mob1 = new Mob("ublyudok",5,12)
                        console.log(mob1.name,mob1.hp,mob1.dmg)
                        readline.question()
                    break

                    case "2":
                        players[0].charCheck()
                    break

                    case "3":
                        gameRun--
                    break

                    default:
                    break
                }

            }
        break

        case "3":
            Menu--
        break

        default:
        break
    }
} 