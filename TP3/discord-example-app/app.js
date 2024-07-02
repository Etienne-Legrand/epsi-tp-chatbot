import "dotenv/config";
import express from "express";
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from "discord-interactions";
import {
  VerifyDiscordRequest,
  getRandomEmoji,
  DiscordRequest,
} from "./utils.js";
import { getShuffledOptions, getResult } from "./game.js";

const app = express();
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};
const logements = [
  { id: "1", name: "Maison" },
  { id: "2", name: "Appartement" },
  { id: "3", name: "Villa" },
  { id: "4", name: "Studio" },
  { id: "5", name: "Ferme" },
];

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post("/interactions", async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === "test") {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "hello world " + getRandomEmoji(),
        },
      });
    }

    // "logement" command
    if (name === "logement") {
      const components = logements.map((logement) => ({
        type: MessageComponentTypes.BUTTON,
        custom_id: `logement_${logement.id}`,
        label: logement.name,
        style: ButtonStyleTypes.SECONDARY,
      }));

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Veuillez sélectionner un type de logement :",
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: components,
            },
          ],
        },
      });
    }
  }

  /**
   * Handle requests from interactive components
   * See https://discord.com/developers/docs/interactions/message-components
   */
  if (type === InteractionType.MESSAGE_COMPONENT) {
    const componentId = data.custom_id;

    if (componentId.startsWith("logement_")) {
      const logementId = componentId.replace("logement_", "");
      const logement = logements.find((logement) => logement.id === logementId);

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Nous avons bien pris en compte votre demande pour un logement de type ${logement.name}, nous vous contacterons prochainement.`,
        },
      });
    }
  }
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
