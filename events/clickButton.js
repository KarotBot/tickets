const { MessageEmbed, Message } = require("discord.js");
const { MessageButton, MessageActionRow } = require("gcommands/src");

module.exports = {
    name: "clickButton",
    once: false,
    run: async(client, button) => {
        await button.defer();

        let buttonMember = button.clicker.member;
        let guild = button.guild;

        if(button.id == "support_ticket_create") {
            let allChannels = client.channels.cache.filter(m => m.type == "text" && m.name.includes("ticket-")).map(m => m.name.split("ticket-")[1]);
            
            let already = allChannels.some(v => buttonMember.user.id.includes(v.toLowerCase()))
            if(already === true) {
                return buttonMember.send("Sorry, you already have ticket.")
            }

            let ticketChannel = await guild.channels.create(`ticket-${buttonMember.user.id}`, {
                type: "text",
                topic: `${buttonMember.user.username}'s ticket`,
                parent: client.tickets.category,
                permissionOverwrites: [
                    {
                        id: buttonMember.id,
                        allow: ["SEND_MESSAGES","VIEW_CHANNEL"]
                    },
                    {
                        id: guild.roles.everyone,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: client.tickets.moderatorRole,
                        allow: ["SEND_MESSAGES","VIEW_CHANNEL"]
                    }
                ]
            })

            let supportEmbed = new MessageEmbed()
                .setColor("#32a852")
                .setDescription("Support will be with you shortly.\nTo close this ticket react with :lock:")
                .setFooter("By Hyro#8938")
                .setTimestamp();

            let supportButton = new MessageButton()
                .setLabel("")
                .setEmoji("🔒")
                .setStyle("gray")
                .setID(`ticket_close_${ticketChannel.id}`)

            ticketChannel.send(`${buttonMember.user} Welcome!`, {embeds: supportEmbed, components: new MessageActionRow().addComponent(supportButton)})
            buttonMember.send(`Your ticket has been created. ${ticketChannel}`)
        }

        if(button.id == `ticket_close_${button.channel.id}`) {
            let ticketChannel = button.channel;
            let createdBy = client.users.cache.get(ticketChannel.name.split("ticket-")[1])

            let yes = new MessageButton().setLabel("").setEmoji("✅").setStyle("gray").setID(`ticket_close_yes_${buttonMember.user.id}`)
            let no = new MessageButton().setLabel("").setEmoji("❌").setStyle("gray").setID(`ticket_close_no_${buttonMember.user.id}`)

            let msg = await ticketChannel.send(`${buttonMember.user} Do you really want close ticket?`, {components: new MessageActionRow().addComponent(yes).addComponent(no)})
            let filter = (button) => buttonMember.user.id == button.clicker.user.id
            let collector = ticketChannel.createButtonCollector(msg, filter, { max: 1, time: 60000, errors: ["time"] })

            collector.on("collect", button => {
                if(button.id == `ticket_close_yes_${button.clicker.user.id}`) {
                    msg.delete();

                    let closedEmbed = new MessageEmbed()
                        .setColor("#4287f5")
                        .setDescription(`Ticket closed by ${button.clicker.user}\nTicket created by ${createdBy}\n\n🔓 Reopen Ticket\n📛 Delete Ticket\n💨 Archive Ticket`)

                    let reopen = new MessageButton()
                        .setLabel("")
                        .setID(`ticket_reopen_${ticketChannel.id}`)
                        .setEmoji("🔓")
                        .setStyle("green")
                   
                    let deleteButton = new MessageButton()
                        .setLabel("")
                        .setID(`ticket_delete_${ticketChannel.id}`)
                        .setEmoji("📛")
                        .setStyle("red")

                    let archiveButton = new MessageButton()
                        .setLabel("")
                        .setID(`ticket_archive_${ticketChannel.id}`)
                        .setEmoji("💨")
                        .setStyle("gray")

                    button.channel.edit({
                        name: `ticket-closed-${createdBy}`,
                        parentID: client.tickets.closedCategory,
                        permissionOverwrites: [
                            {
                                id: createdBy.id,
                                deny: ["VIEW_CHANNEL"]
                            },
                            {
                                id: guild.roles.everyone,
                                deny: ["VIEW_CHANNEL"]
                            },
                            {
                                id: client.tickets.moderatorRole,
                                allow: ["SEND_MESSAGES","VIEW_CHANNEL"]
                            }
                        ]
                    })

                    button.channel.send("", {embeds: closedEmbed, components: new MessageActionRow().addComponent(reopen).addComponent(deleteButton).addComponent(archiveButton)})
                } else {
                    msg.delete();
                }
            })
        }

        if(button.id == `ticket_reopen_${button.channel.id}`) {
            let ticketChannel = button.channel;
            let createdBy = client.users.cache.get(ticketChannel.name.split("ticket-closed-")[1]) ? client.users.cache.get(ticketChannel.name.split("ticket-closed-")[1]) : client.users.cache.get(ticketChannel.name.split("ticket-")[1])

            let allMessages = await ticketChannel.messages.fetch()
            let systemMessages = allMessages.filter(m => m.embeds && m.author.id == client.user.id);
            systemMessages.forEach(msg => {msg.delete()})

            let supportEmbed = new MessageEmbed()
                .setColor("#32a852")
                .setDescription("Support will be with you shortly.\nTo close this ticket react with :lock:")
                .setFooter("By Hyro#8938")
                .setTimestamp();

            let supportButton = new MessageButton()
                .setLabel("")
                .setEmoji("🔒")
                .setStyle("gray")
                .setID(`ticket_close_${ticketChannel.id}`)

            ticketChannel.edit({
                name: `ticket-${createdBy}`,
                parentID: client.tickets.category,
                permissionOverwrites: [
                    {
                        id: createdBy.id,
                        allow: ["VIEW_CHANNEL"]
                    },
                    {
                        id: guild.roles.everyone,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: client.tickets.moderatorRole,
                        allow: ["SEND_MESSAGES","VIEW_CHANNEL"]
                    }
                ]
            })

            ticketChannel.send(`${createdBy} Welcome back!`, {embeds: supportEmbed, components: new MessageActionRow().addComponent(supportButton)})
        }

        if(button.id == `ticket_delete_${button.channel.id}`) {
            let ticketChannel = button.channel;

            let deleteEmbed = new MessageEmbed()
                .setColor("#f54257")
                .setDescription("Ticket deleted in 5s")
            
            ticketChannel.send("", {embeds: deleteEmbed})
            setTimeout(() => {ticketChannel.delete()}, 5000);
        }

        if(button.id == `ticket_archive_${button.channel.id}`) {
            let ticketChannel = button.channel;
            let createdBy = client.users.cache.get(ticketChannel.name.split("ticket-closed-")[1]) ? client.users.cache.get(ticketChannel.name.split("ticket-closed-")[1]) : client.users.cache.get(ticketChannel.name.split("ticket-")[1])

            let allMessages = await ticketChannel.messages.fetch()
            let systemMessages = allMessages.filter(m => m.embeds && m.author.id == client.user.id);
            console.log(systemMessages)
            systemMessages.forEach(msg => {msg.delete()})

            let archiveEmbed = new MessageEmbed()
                .setColor("#f5bf42")
                .setDescription("The ticket has been archived. You can just delete it.")

            button.channel.edit({
                name: `ticket-archived-${createdBy}`,
                parentID: client.tickets.archiveCategory,
                permissionOverwrites: [
                    {
                        id: createdBy.id,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: guild.roles.everyone,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: client.tickets.moderatorRole,
                        deny: ["SEND_MESSAGES"]
                    }
                ]
            })

            button.channel.send("", {embeds: archiveEmbed})
        }
    }
}