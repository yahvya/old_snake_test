const {app,BrowserWindow} = require("electron")

app.whenReady().then(() => {

    const window = new BrowserWindow({
        width : 500,
        height : 500,
        icon : "resources/favicon.png"
    })

    window.loadFile("index.html")

})

app.on("window-all-closed",() => {
    if(process.platform != "darwin")
        app.quit()
})