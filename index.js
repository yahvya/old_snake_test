window.addEventListener("load",() => {

    // game global variables
    let player_pseudo = "Default name"
    let player_score = 0
    let snake_speed = 20
    let snake_body = []
    let snake_direction = "right"
    let global = {}
    let song = null
    let current_game = null
    let fruit = null 

    // game div
    const game_container = document.getElementById("game_container")

    // global functions

    // function which show a message in popup
    const Show_message = (message) => {
        
        let message_container = document.createElement("div")
        let message_text = document.createElement("p")
        let close_message_button = document.createElement("button")

        message_text.append(document.createTextNode(message) )

        close_message_button.append(document.createTextNode("Ok") )
        close_message_button.addEventListener("click",() => {
            message_container.animate({
                opacity : 0
            },700)

            setTimeout(() => {
                message_container.parentNode.removeChild(message_container)
            },650)
        })
        
        message_container.classList.add("message","flex_column")
        message_container.append(message_text,close_message_button)

        document.body.append(message_container)
    }

    // function which set global variables and change them in css
    const Set_global = () => {
        Object.assign(global,{
            game_container_width : window.innerWidth / 1.2,
            game_container_height : window.innerHeight / 1.2,
            snake_body_part_size : 10,
            fruit_size : 15,
            game_container_background_color : "#333333",
            snake_body_color : "#ffff00",
            snake_head_color : "#00a000",
            fruit_color: "#00a000",
            button_color : "#fff",
            sub_color : "#333",
            text_color : "#fff"
        })
        
        // set css variables
        for(variable in global)
            document.body.style.setProperty(`--${variable}`,global[variable])
    }

    // function which manage game starting instructions
    const Show_game_instruction = (i) => {

        let current_instruction = instruction_list[i]
        let instruction_text = document.createElement("p")

        instruction_text.classList.add("instruction")

        if(current_instruction.action == null)
        {
            let next_button = document.createElement("button")

            instruction_text.append(document.createTextNode(current_instruction.instruction) )
            
            next_button.append(document.createTextNode("Suivant") )
            next_button.classList.add("instruction_button")
            next_button.addEventListener("click" ,() => {
                
                while(el = game_container.firstChild)
                    game_container.removeChild(el)

                Show_game_instruction(++i) 
            })

            game_container.append(instruction_text,next_button)
        }
        else
        {
            instruction_text.append(document.createTextNode(current_instruction.instruction) )

            game_container.append(instruction_text)

            current_instruction.action(i)
        }
    }  

    // function which show all tools
    const Show_tools = () => {

        let tools_container = document.createElement("div")

        tools_container.classList.add("tools_container","flex_column")
        
        for(tool in game_tools)
        {
            let tool_button = document.createElement("button") 
            
            tool_button.append(document.createTextNode(game_tools[tool].tool) )
            tool_button.addEventListener("click",game_tools[tool].action)

            tools_container.append(tool_button)
        }

        game_container.append(tools_container)
    } 

    // function which get the player pseudo
    const Get_player_pseudo = (i) => {

        let user_input = document.createElement("input")
        let get_pseudo_button = document.createElement("button")

        user_input.placeholder = "Entrez ici votre pseudo"

        get_pseudo_button.append(document.createTextNode("Snake") )
        get_pseudo_button.classList.add("instruction_button")
        get_pseudo_button.addEventListener("click",() => {

            player_pseudo = user_input.value

            if(player_pseudo.length > 1)
            {
                while(el = game_container.firstChild)
                    game_container.removeChild(el)
            
                document.addEventListener("keyup",event => {
            
                    switch(event.key.toLowerCase() )
                    {
                        case "arrowright": snake_direction = "right"; break;
                        
                        case "arrowleft" : snake_direction = "left"; break;
            
                        case "arrowup" : snake_direction = "up"; break;
            
                        case "arrowdown" : snake_direction = "down"; break;
                    }
                })

                Show_tools()
                Play_game()
            }
            else
                Show_message("Veuillez saisir un pseudo correct au moins 2 caractères")
        })
        
        game_container.append(user_input,get_pseudo_button)
    }

    // tools functions

    // function which active the game song
    const Active_game_song = () => {

        if(song == null)
        {
            song = new Audio("resources/game_song.mp3")

            song.controls = false
            song.loop = true
            song.play()
        }
        else if(song.paused)
            song.play()
        else
            song.pause()
    }

    // game functions

    // function which will be called when end gale
    const End_game = () => {
        
        clearInterval(current_game)

        while(el = game_container.firstChild)
            game_container.removeChild(el)

        let text = document.createElement("p")
        let restart_button = document.createElement("button")

        text.append(document.createTextNode(`Fin du jeux "${player_pseudo}" vous avez un score de : ${player_score} `) )
        text.classList.add("instruction")

        restart_button.append(document.createTextNode("Rejouer") )
        restart_button.addEventListener("click",() => {

            player_score = 0

            snake_body = []

            // reset elements in game container after add player game data,fruit and snake body

            while(el = game_container.firstChild)
                game_container.removeChild(el)

            Show_tools()
            Play_game()
        })

        game_container.append(text,restart_button)
    }

    // function which manage the entire game
    const Play_game = () => {

        let previous_coords
        let previous_coords_
        let collision
        let cmp_x
        let cmp_y
        let cmp_x_
        let cmp_y_

        let player_game_state = document.createElement("p")
        let player_pseudo_span = document.createElement("span")
        let player_score_span = document.createElement("span")

        player_pseudo_span.append(document.createTextNode(player_pseudo) )

        player_score_span.append(document.createTextNode(player_score) )

        player_game_state.classList.add("player_game_state")
        player_game_state.append(document.createTextNode("Pseudo : "),player_pseudo_span,document.createTextNode(" - Score : "),player_score_span)

        fruit = document.createElement("div")
        fruit.id = "fruit"
        Object.assign(fruit.style,{
            top: `${Math.random() * 90 }%`,
            left: `${Math.random() * 90 }%`
        })

        snake_body.push(document.createElement("span") )
        snake_body[0].classList.add("snake_body_part","snake_head")
        Object.assign(snake_body[0].style,{
            top: "30px",
            left: "30px"
        })

        game_container.append(player_game_state,fruit,snake_body[0])

        current_game = setInterval(() => {

            previous_coords = {x : snake_body[0].offsetLeft,y : snake_body[0].offsetTop}

            switch(snake_direction)
            {
                case "right": 
                    snake_body[0].style.left = `${snake_body[0].offsetLeft + snake_speed}px`; 

                    if(snake_body[0].offsetLeft > global.game_container_width ) 
                        snake_body[0].style.left = "0px"
                break;

                case "left": 
                    snake_body[0].style.left = `${snake_body[0].offsetLeft - snake_speed}px`; 

                    if(snake_body[0].offsetLeft < (0 - global.snake_body_part_size) ) 
                        snake_body[0].style.left = `${global.game_container_width}px`
                break;

                case "up": 
                    snake_body[0].style.top = `${snake_body[0].offsetTop - snake_speed}px`;
                    
                    if(snake_body[0].offsetTop < (0 - global.snake_body_part_size)) 
                        snake_body[0].style.top = `${global.game_container_height}px`
                break;

                case "down": 
                    snake_body[0].style.top = `${snake_body[0].offsetTop + snake_speed}px`; 

                    if(snake_body[0].offsetTop > global.game_container_height ) 
                        snake_body[0].style.top = "0px"
                break;
            }

            collision = false

            for(cmp_y = snake_body[0].offsetTop; cmp_y < snake_body[0].offsetTop + global.snake_body_part_size; cmp_y++)
            {
                for(cmp_x = snake_body[0].offsetLeft; cmp_x < snake_body[0].offsetLeft + global.snake_body_part_size; cmp_x++)
                {
                    if(cmp_y >= fruit.offsetTop && (cmp_y <= fruit.offsetTop + global.fruit_size) && cmp_x >= fruit.offsetLeft && cmp_x <= (fruit.offsetLeft + global.fruit_size) )
                    {
                        snake_body.push(document.createElement("span") )    
                        snake_body[snake_body.length - 1].classList.add("snake_body_part")

                        game_container.append(snake_body[snake_body.length - 1])

                        Object.assign(fruit.style,{
                            top: `${Math.random() * 90}%`,
                            left: `${Math.random() * 90}%`
                        })

                        player_score++

                        player_score_span.textContent = player_score

                        collision = true

                        break
                    }
                }

                if(collision == true)
                    break
            }

            cmp_x = snake_body[0].offsetLeft + (global.snake_body_part_size / 2)
            cmp_y = snake_body[0].offsetTop + (global.snake_body_part_size / 2)

            for(let inc = 1; inc < snake_body.length; inc++)
            {
                previous_coords_ = {x : snake_body[inc].offsetLeft,y : snake_body[inc].offsetTop}

                Object.assign(snake_body[inc].style,{
                    top : `${previous_coords.y}px`,
                    left : `${previous_coords.x}px`
                })

                Object.assign(previous_coords,{
                    x : previous_coords_.x,
                    y : previous_coords_.y
                })

                cmp_x_ = snake_body[inc].offssetLeft + (global.snake_body_part_size / 2)
                cmp_y_ = snake_body[inc].offsetTop + (global.snake_body_part_size / 2)

                if(cmp_x == cmp_x_ && cmp_y == cmp_y_)
                    End_game()
            }

        },100)
    }

    // list of game tools and their associate action/function
    const game_tools = [
        {tool : "Musique",action : Active_game_song},
        {tool : "Recommencer une partie",action : End_game}
    ]

    // list of game instructions and their associate action/function
    const instruction_list = [
        {instruction : "Bienvenue sur le jeux du serpent",action : null},
        {instruction : "Le but du jeux est de manger le plus de fruits possible sans toucher votre queue ! ",action : null},
        {instruction : "Veuillez saisir votre pseudo",action :  Get_player_pseudo }
    ]

    // starting game with set global variables and show first instruction
    Set_global()
    Show_game_instruction(0)

    // reset global variable on window resize
    window.addEventListener("resize",Set_global)
})