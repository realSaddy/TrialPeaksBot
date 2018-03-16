const Discord = require("discord.js");
const client = new Discord.Client();
const sql = require("sqlite");
const prefix = "!"
const util = require("util");

sql.open("./sql/checkedout.sqlite")
sql.open("./sql/ownedby.sqlite")

function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}

function ccreate(message, name) {
        message.guild.createChannel(name, 'text', [{
        id: message.guild.id,
        deny: ['SEND_MESSAGES']
      }])
      .then(channel => {
        channel.setParent("421757483762057222")
          //give permissions
        channel.overwritePermissions(message.author, {
        SEND_MESSAGES: true
      });

        sql.get(`SELECT * FROM ownedby WHERE id = ${channel.id}`).then(row => {
            if(!row) { 
            sql.run("INSERT INTO ownedby (id, owner) VALUES (?, ?)", [channel.id, message.author.id]);
            }
            sql.run(`UPDATE ownedby SET owner = ${message.author.id} WHERE id = ${channel.id}`)
            
        }).catch(() => {
          console.error;
          sql.run("CREATE TABLE IF NOT EXISTS ownedby (id TEXT, owner TEXT)").then(() => {
            sql.run("INSERT INTO ownedby (id, owner) VALUES (?, ?)", [channel.id, message.author.id]); 
          })
        });
      }).catch(console.error);
}

function removeout(message,channel) {
      sql.get(`SELECT * FROM checkedout WHERE id = ${message.author.id}`).then(row =>  {
       sql.run(`UPDATE checkedout SET num = ${row.num - 1} WHERE id = ${message.author.id}`) 
        deletechannel(message,channel)
      }).catch(() => {
          console.error;   
      })

}

function deletechannel(message, channel) {
  
  channel.delete()
}

client.on("ready", () => {
  console.log("Bot is online!");
  client.user.setPresence({ game: { name: "!help for commands!", streaming: true, url: "https://www.twitch.tv/realsaddy" }});
});

client.on("message", async message => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") {
  return message.reply("I can not use commands in DMs. Please use them here <#421758144193101845>");
  }
  let args = message.content.substring(prefix.length).split(" ");
  
  
    if (message.content.startsWith("!eval")) {
      console.log("start")
    if(message.author.id !== "210542490539786240" && message.author.id !== "214511140045062146") {
      return message.reply("Sorry, only my owner can use this command")
      
    }
      try {
        const temp = args.slice(1)
      const code = temp.join(" ");
        console.log(code)
      let evaled = eval(code);

      if (typeof evaled !== "string")
        evaled = require("util").inspect(evaled);

      message.channel.send(clean(evaled), {code:"xl"});
    } catch (err) {
      console.log(err.stack)
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
  }
  
  switch (args[0].toLowerCase()) {
      
    case "ping":
      const m = await message.channel.send(".");
    m.edit(`Ping is ${m.createdTimestamp - message.createdTimestamp}ms. API Ping is ${Math.round(client.ping)}ms`);
      break;
    
    case "help":
      const embed = {
  "color": 6770057,
  "timestamp": "2018-03-09T20:20:47.413Z",
  "footer": {
    "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png"
  },
  "thumbnail": {
    "url": "https://cdn.discordapp.com/icons/361679179571396615/308647e8ba311af6c68794cf36b9723b.webp"
  },
  "image": {
    "url": "https://i.imgur.com/yKm4Hth.png"
  },
  "author": {
    "name": "Created by Saddy#4781",
    "url": "https://www.youtube.com/channel/UCFoL5-GzBBm_w_hMZg9bUsA?view_as=subscriber",
    "icon_url": "https://cdn.discordapp.com/avatars/210542490539786240/ff678a617d6225897455b2453340cd76.png?size=2048"
  },
  "fields": [
    {
      "name": "!Ping",
      "value": "A ping command, nothing more to be said"
    },
    {
      "name": "!Help",
      "value": "DM's you this"
    }
  ]
};
  message.author.send({ embed });
      break;
      
    case "rent":
      if(args.length < 2) {
        return message.reply("You have to name it something")
      }
      if(args.length > 9) {
        return message.reply("There is a max of 8 words per name")
      }
      args.shift();
      var name = args.join(' ')
      if(name.length > 50) {
        return message.reply("There is a max of 50 characters per name. Try using abbreviations")
      }
        //add sql to the amount of rooms he has checked out
      sql.get(`SELECT * FROM checkedout WHERE id = ${message.author.id}`).then(row =>  {
        if(!row) {
          sql.run("INSERT INTO checkedout (id, num) VALUES (?, ?)", [message.author.id, 1]);
      } else {
          if(row.num >= 1) {
            return message.reply("You may only have 1 channels at a time")
          }
       sql.run(`UPDATE checkedout SET num = ${row.num + 1} WHERE id = ${message.author.id}`) 
        ccreate(message, name)
      }
      }).catch(() => {
          console.error;
        sql.run("CREATE TABLE IF NOT EXISTS checkedout (id TEXT, num INTEGER)").then(() => {
          sql.run("INSERT INTO checkedout (id, num) VALUES (?, ?)", [message.author.id, 1]);
        });
        
      //make channel


            
    
     
      
      
      
      
      //add sql to the time it expires in
      });
      
    break;
  
    case "return":
      // var test = args.join(" ")
      // test = test.replace(/return<#>/g,'')
      // console.log(test)
      
      
      if(args.length < 2 || args.length > 2) {
        return message.reply("Please tag the channel you wish to return (Example: <#421506673040162827>)")
         }
      try {
      var tempargs = args.join(" ")
      var tempargs2 = tempargs.split("")
      var tempargs3 = tempargs2.splice(9,18)
      var oldchannel = tempargs3.join("")
      } catch(e) {
        console.error(e)
        return message.reply("That channel is invalid or doesn't exist, please tag the channel (Example: <#421506673040162827>)")
      }
      if(!message.guild.channels.find('id', oldchannel)) return message.reply("That channel does not exist. If that channel was deleted ask them to do `!forceclear "+channel+"`")
      var channel = message.guild.channels.find('id', oldchannel)
      sql.get(`SELECT * FROM ownedby WHERE id = ${channel.id}`).then(row => { 
        if(row.owner !== message.author.id) {
              return message.channel.send("Sorry, but it seems you do not own this channel")
            }
              sql.run(`DELETE FROM ownedby WHERE id = ${channel.id}`)
        removeout(message,channel)
        }).catch(() => {
          console.error;
        });

      message.channel.send("Room returned")
      break;
      
    case "rooms":
      let target = message.mentions.users.first() || message.guild.members.get(args[1]) || message.author;
      sql.get(`SELECT * FROM checkedout WHERE id = ${target.id}`).then(row =>  {
      sql.get(`SELECT * FROM ownedby WHERE owner = ${target.id}`).then(row2 => {
        var roomnum= row.num
        
        
        
      const embed = {
        "title":  "Rooms",
        "description": target+"'s Rooms",
        "color": 6770057,
        "timestamp": "2018-03-11T19:54:20.420Z",
        "fields": [
    {
         "name": "Number of Rooms Owned",
         "value": roomnum+"/1"
       },
       {
         "name": "Rooms:",
         "value": "<#"+row2.id+">"
       }
    ]
  };
message.channel.send({ embed });
      
      

      

      }).catch(() => {
          console.error;
        });
      }).catch(() => {
          console.error;   
      })

      
    
      break;
    case "forceclear":
      if(!message.member.hasPermission("MANAGE_GUILD")) return message.reply("You must have the permission MANAGE_SERVER")
      if(args.length < 2 || message.mentions.users.size === 0 || args.length > 2) return message.reply("Please tag the user you wish to clear")
      let user = message.guild.member(message.mentions.users.first());
      if(!user) {
        return message.reply("That user is not valid");
      }
      
      sql.get(`SELECT * FROM checkedout WHERE id = ${user.id}`).then(row =>  {
       sql.run(`UPDATE checkedout SET num = 0 WHERE id = ${user.id}`) 
      }).catch(() => {
          console.error;   
      })
      sql.get(`SELECT * FROM ownedby WHERE owner = ${user.id}`).then(row => {
        sql.run(`DELETE FROM ownedby WHERE owner = ${user.id}`);
      }).catch(() => {
        console.error;
      });
      message.reply("User cleared")
      
      break;
      
                               }});
client.login(process.env.BOT_TOKEN);