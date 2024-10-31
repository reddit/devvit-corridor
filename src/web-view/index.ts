import {Game} from './game.js'

let i = 0
crypto.randomUUID ??= () => `${i}-${i}-${i}-${i}-${i++}`

const game = await Game.new()
game.start()
