process.stdout.write('\x1Bc')
let readline = require("readline-sync")
class Player{
    constructor(name,hp,dmg,id){
        this.name = name
        this.hp = hp
        this.dmg = dmg
        this.id = id
    }
}
let quit = 0
let players = []
let IdCount = 0
let help = "[1] Create a player\n[2] Edit a player\n[3] Player List\n[q] Quit\n[c] Clear console\n[h] Help"
console.log(help)
while (quit == 0) {
    let com = readline.question()
    switch(com){
        case "h":
            console.log(help)
        break
        case "1":
            let name = readline.question("\nCreate a player\n"+"Name: ")
            let hp = readline.question("HP: ")
            let dmg = readline.question("DMG: ")
            let id = IdCount
            IdCount++
            players[id] = new Player(name,hp,dmg,id)
            console.dir(players[id])
        break
        case "2":
            let playerID = readline.question("PlayerID to edit?\nID: ")
            let edit = readline.question("What stat to edit?\n[1] Name\n[2] HP\n[3] DMG\n Stat:")

            switch(edit){
                case "1":
                    players[playerID].name = readline.question("Name: ")
                break
                case "2":
                    players[playerID].HP = readline.question("HP: ")
                break
                case "3":
                    players[playerID].dmg = readline.question("DMG: ")
                break
            }

        break
        case "3":
            console.log(players)
        break
        case "q":
            quit = 1
        break
        case "c":
            process.stdout.write('\x1Bc')
        break

        default:
            console.error("Wrong command.")
        break
    }
}