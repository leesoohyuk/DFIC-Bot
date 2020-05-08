const Discord = require("discord.js")
const firebase = require("firebase")
const client = new Discord.Client()
const mention = /<@(!|&|\d)\d+>/g
const PREFIX = "!"

let count = []

client.on('ready', () => {
  console.log("ready")
})

const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    databaseURL: process.env.databaseURL,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId
}
firebase.initializeApp(firebaseConfig)
const db = firebase.firestore()

function givemute(server, member){
    server.roles.cache.forEach((role) => {
        if(role.name === "mute"){
            member.edit({roles: null}).then(() => {
                member.roles.add(role)
                db.collection("mutelist").doc(member.id).set({
                    muteid: member.id
                })
            })
        }
    })
}
function unmute(server, member){
    server.roles.cache.forEach((role) => {
        if(role.name === "user"){
            member.edit({roles: null}).then(() => {
                db.collection("mutelist").doc(member.id).delete()
                member.roles.add(role)
            })
        }
    })
}
client.on("guildMemberAdd", (member) => {
    let muteuser = db.collection("mutelist").doc(member.id)
    muteuser.get().then((doc) => {
        if (doc.exists) {
            member.ban()
            member.send("당신은 DFIC규칙 13항(뮤트가 되었을시 서버를 나갔다 들어옴으로써 뮤트를 풀면 바로 밴(차단)이다.)를 어겼으므로 DFIC에서 밴(차단) 처리 되었습니다. 이의 있으시면 <@473327037327736834> 여기로 DM남겨주세요.")
            db.collection("mutelist").doc(member.id).delete()
        }
    })
})
client.on('message', (message) => {
    if(message.author.bot){
        return
    }if(message.channel.type == 'dm'){
        return
    }if(message.channel.name === "반성의-방"){
        return
    }

    let server = message.guild
    let mentiontext = message.content.match(mention)
    let mentioncount = 0
    let user = message.author

        if(message.author.id != "706431855104360468"){
        server.members.cache.forEach((member) =>{
            if(member.id === user.id){
                let args = message.content.substring(PREFIX.length).split(" ")
                switch (args[0].toLowerCase()){
                    case "unmute":
                        let unmuteuser = message.content.match(mention)
                        if(unmuteuser){
                            if(member.manageable){
                                message.channel.send("당신은 서버의 관리자가 아니므로 뮤트를 해제할 수 없습니다.")
                            }else{
                                unmute(server, member)
                                message.channel.send("당신은 관리자에 의해 DFIC에서 정상적으로 뮤트해제 되었습니다. 이제 정상적으로 활동하실 수 있습니다.")
                            }
                        }else{
                            if(member.manageable){
                                message.channel.send("당신은 서버의 관리자가 아니므로 뮤트를 해제할 수 없습니다.")
                            }message.channel.send("뮤트 해제할 사용자를 멘션하여 주세요.")
                        }
                    break
                }if(mentiontext === null){
                }else{
                    while(mentiontext[mentioncount]){
                        mentioncount++
                    }
                    if(mentioncount >= (5 - 1)){
                        if(!member.manageable){
                            return
                        }else{
                            givemute(server, member)
                            member.send("당신은 DFIC에서 멘션테러를 했으므로 mute가 되었습니다. 이의 있으시면 관리자에게 문의하세요.")
                        }
                    }
                }
                let i = 0
                do{
                    if(!count[i]){
                        if(message.content.length >= 500){
                            count.push({id: user.id, msgcount: 1, content: message.content, samemsgcount: 1, lagmsgcount: 1})
                            return
                        }else{
                            count.push({id: user.id, msgcount: 1, content: message.content, samemsgcount: 1, lagmsgcount: 0})
                            return
                        }
                    }else if(count[i].id === user.id){
                        if(count[i].content === message.content){
                            count[i].msgcount++
                            count[i].samemsgcount++
                            if(count[i].msgcount >= 7){
                                if(!member.manageable){
                                    return
                                }else{
                                    givemute(server, member)
                                    member.send("당신은 DFIC에서 도배를 했으므로 mute가 되었습니다. 이의 있으시면 관리자에게 문의하세요.")
                                }
                            }if(count[i].samemsgcount >= 5){
                                if(!member.manageable){
                                    return
                                }else{
                                    givemute(server, member)
                                    member.send("당신은 DFIC에서 도배를 했으므로 mute가 되었습니다. 이의 있으시면 관리자에게 문의하세요.")
                                }
                            }else if(message.content.length >= 500){
                                count[i].lagmsgcount++
                            }if(count[i].lagmsgcount >= 3){
                                if(!member.manageable){
                                    return
                                }else{
                                    givemute(server, member)
                                    member.send("당신은 DFIC에서 도배를 했으므로 mute가 되었습니다. 이의 있으시면 관리자에게 문의하세요.")
                                }
                            }
                        }else{
                            if(count[i].msgcount >= 7){
                                if(!member.manageable){
                                    return
                                }else{
                                    givemute(server, member)
                                    member.send("당신은 DFIC에서 도배를 했으므로 mute가 되었습니다. 이의 있으시면 관리자에게 문의하세요.")
                                }
                            }else if(message.content.length >= 500){
                                count[i].lagmsgcount++
                                count[i].content = message.content
                                count[i].msgcount++
                                count[i].samemsgcount = 1
                            }if(count[i].lagmsgcount >= 3){
                                if(!member.manageable){
                                    return
                                }else{
                                    givemute(server, member)
                                    member.send("당신은 DFIC에서 도배를 했으므로 mute가 되었습니다. 이의 있으시면 관리자에게 문의하세요.")
                                }
                            }else{
                                count[i].content = message.content
                                count[i].msgcount++
                                count[i].samemsgcount = 1
                            }
                        }
                        return
                    }else{
                        if(message.content.length >= 700){
                            count.push({id: user.id, msgcount: 1, content: message.content, samemsgcount: 1, lagmsgcount: 1})
                        }else{
                            count.push({id: user.id, msgcount: 1, content: message.content, samemsgcount: 1, lagmsgcount: 0})
                        }
                    }
                    i++
                }while(count[i])
            }
        })
    }
})

setInterval(() => {count = []}, 10000)

const token = process.env.token

client.login(token)