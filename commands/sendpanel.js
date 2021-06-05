const { MessageEmbed } = require("discord.js");
const { MessageButton, MessageActionRow } = require("gcommands/src");

module.exports = {
    name: "sendpanel",
    description: "Send panel :O",
    guildOnly: "822467921653137438",
    slash: false,
    userRequiredPermissions: "ADMINISTRATOR",
    run: async({client, respond}) => {
      let embed = new MessageEmbed()
      .setTitle('Create a Ticket')
      .setColor('#E54918')
      .setDescription('Using the button below, you can create a ticket and get support regarding the bot!\nPlease make sure that you **have read the docs ** before creating a ticket!')
      .addField('General Guidelines', ':one: Do not create tickets without reason, any abuse of the ticket system will be punished with a ban!\n\n:two: Always read the docs before creating a ticket, this can save time for both you and us.\n\n :three: Be respectful to all staff and support team members within the ticket.\n\n:four: Please always describe what you need in the ticket __before__ being asked by staff, this will make the time for the problem to be solved much faster! ')
      .addField('Data & Privacy', 'Please do not request a deletion or copy of your data from here, instead write us an email at __info@karot.xyz__!')
      .setFooter('Need help? Check https://docs.karot.xyz before asking.', 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/274/sos-button_1f198.png')

      let button = new MessageButton()
        .setLabel("Create")
        .setStyle("gray")
        .setID("support_ticket_create")

      respond({
        content: embed,
        inlineReply: false,
        components: new MessageActionRow().addComponent(button)
      })
  }
};
