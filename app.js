const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const score = document.querySelector('#score')
const Hello = document.querySelector('#hello')
const startgame = document.querySelector('.start')
const bigscore = document.querySelector('h1')

class Player {
    constructor (x , y , radius , color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.98
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }
    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }
    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.04
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 18, 'white')
let projectiles = []
let enemies = []
let particles = []

function init() {
    player = new Player(x, y, 18, 'white')
    projectiles = []
    enemies = []
    particles = []
    scores = 0
    score.innerHTML = scores
    bigscore.innerHTML = scores
}

function spawnenemies() {
    setInterval(() => {
        //radius max and min values
        const radius = Math.random() * (30 - 10) + 10

        let x
        let y

        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        }
        else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
    
    const velocity = {
        x: Math.cos(angle) ,
        y: Math.sin(angle)
    }
        enemies.push(new Enemy(x,y,radius,color,velocity))
        
    },2500)
}

let animationId
let scores = 0
function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.2)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()

    particles.forEach((particle, index) => {
        if(particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update()
        }
    })

    projectiles.forEach((projectile, index) => {
        projectile.update()
        
        //remove from edges of screen
        if(projectile.x - projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y - projectile.radius < 0 || projectile.y - projectile.radius > canvas.width) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)  
        }
    })
    //collision detection between projectiles and enemies
    enemies.forEach((enemy, index) => {
        enemy.update()

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y )
        
        //end game
        if(dist - enemy.radius - player.radius < 1) {
           cancelAnimationFrame(animationId)
           startgame.style.display = 'flex'
           bigscore.innerHTML = scores
        }

        projectiles.forEach((projectile, pro_index) => {
           const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y )
           
           //while projectiles touch enemy
            if(dist - enemy.radius - projectile.radius < 1) {
               //make tiny particles
                for(let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {x: (Math.random() - 0.5) * (Math.random() * 6), y: (Math.random() - 0.5) * (Math.random() * 6)}) )
                }
                if(enemy.radius - 10 > 5) {
                    //increase score 
                    scores += 100
                    score.innerHTML = scores
                    gsap.to(enemy, {
                       radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(pro_index, 1)
                    }, 0) 
                }else {
                    //remove from scene altogether
                    scores += 150
                    score.innerHTML = scores
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(pro_index, 1)
                    }, 0) 
                }
            }
        })
    })
}

addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)

    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    projectiles.push(new Projectile(canvas.width / 2, canvas.height/2, 3, 'white',velocity))
})

Hello.addEventListener('click',()=>{
    init()
    animate()
    spawnenemies()
    startgame.style.display = 'none'
})